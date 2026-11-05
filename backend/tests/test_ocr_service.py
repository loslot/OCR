import unittest
from unittest.mock import patch

import cv2
import numpy as np
from fastapi import HTTPException
from pytesseract.pytesseract import TesseractNotFoundError

from app.services.ocr_service import OCRService


class OCRServiceTests(unittest.TestCase):
    def setUp(self):
        self.service = OCRService()

    def test_language_codes_include_khmer_and_mixed(self):
        with patch.object(self.service, "_available_languages", return_value={"eng", "khm"}):
            self.assertEqual(self.service.get_language("km"), ("khm", "km"))
            self.assertEqual(self.service.get_language("km+en"), ("khm+eng", "km+en"))
            self.assertEqual(self.service.get_language("en"), ("eng", "en"))

    def test_missing_khmer_data_has_actionable_error(self):
        with patch.object(self.service, "_available_languages", return_value={"eng"}):
            with self.assertRaises(HTTPException) as raised:
                self.service.get_language("km")
        self.assertEqual(raised.exception.status_code, 503)
        self.assertIn("khm", raised.exception.detail)

    def test_missing_tesseract_executable_has_actionable_error(self):
        with patch("app.services.ocr_service.pytesseract.get_languages",
                   side_effect=TesseractNotFoundError()):
            with self.assertRaises(HTTPException) as raised:
                self.service._available_languages()
        self.assertEqual(raised.exception.status_code, 503)
        self.assertIn("Tesseract OCR is not installed", raised.exception.detail)

    def test_invalid_image_is_rejected(self):
        with self.assertRaises(HTTPException) as raised:
            self.service.preprocess_image(b"not an image")
        self.assertEqual(raised.exception.status_code, 400)

    def test_preprocessing_produces_single_channel_binary_image(self):
        image = np.full((100, 240, 3), 255, dtype=np.uint8)
        cv2.putText(image, "OCR 123", (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
        ok, encoded = cv2.imencode(".png", image)
        self.assertTrue(ok)
        processed = self.service.preprocess_image(encoded.tobytes())
        self.assertEqual(processed.ndim, 2)
        self.assertEqual(set(np.unique(processed)), {0, 255})

    def test_word_results_are_grouped_into_line_details(self):
        data = {
            "text": ["Hello", "World", "Second"], "conf": ["90", "80", "100"],
            "page_num": [1, 1, 1], "block_num": [1, 1, 1],
            "par_num": [1, 1, 1], "line_num": [1, 1, 2],
            "left": [10, 55, 10], "top": [20, 20, 50],
            "width": [40, 45, 50], "height": [12, 12, 14],
        }
        details = self.service._format_details(data)
        self.assertEqual([line["text"] for line in details], ["Hello World", "Second"])
        self.assertEqual(details[0]["confidence"], 0.85)
        self.assertEqual(details[0]["box"], [[10, 20], [100, 20], [100, 32], [10, 32]])

    def test_empty_ocr_result_returns_meaningful_error(self):
        image = np.full((120, 300, 3), 255, dtype=np.uint8)
        ok, encoded = cv2.imencode(".png", image)
        self.assertTrue(ok)
        empty_data = {key: [] for key in (
            "text", "conf", "page_num", "block_num", "par_num", "line_num",
            "left", "top", "width", "height",
        )}
        with (
            patch.object(self.service, "_available_languages", return_value={"eng"}),
            patch("app.services.ocr_service.pytesseract.image_to_data", return_value=empty_data),
        ):
            with self.assertRaises(HTTPException) as raised:
                self.service.extract_text("doc", "empty.png", encoded.tobytes(), "en")
        self.assertEqual(raised.exception.status_code, 422)
        self.assertIn("No text was detected", raised.exception.detail)


if __name__ == "__main__":
    unittest.main()
