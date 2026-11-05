import unittest
from unittest.mock import patch

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.services.file_service import file_service
from app.services.ocr_service import ocr_service


class OCRAPIIntegrationTests(unittest.TestCase):
    def test_extract_keeps_existing_response_contract_for_mixed_language(self):
        image = np.full((120, 300, 3), 255, dtype=np.uint8)
        ok, encoded = cv2.imencode(".png", image)
        self.assertTrue(ok)
        data = {
            "text": ["Hello", "123"], "conf": ["92", "88"],
            "page_num": [1, 1], "block_num": [1, 1], "par_num": [1, 1], "line_num": [1, 1],
            "left": [10, 80], "top": [20, 20], "width": [60, 30], "height": [15, 15],
        }
        with (
            patch.object(file_service, "generate_document_id", return_value="test-document"),
            patch.object(file_service, "save_upload_file"),
            patch.object(file_service, "save_result"),
            patch.object(ocr_service, "_available_languages", return_value={"eng", "khm"}),
            patch("app.services.ocr_service.pytesseract.image_to_data", return_value=data),
        ):
            response = TestClient(app).post(
                "/api/ocr/extract",
                files={"file": ("test.png", encoded.tobytes(), "image/png")},
                data={"language": "km+en"},
            )

        self.assertEqual(response.status_code, 201, response.text)
        body = response.json()
        self.assertEqual(body["extracted_text"], "Hello 123")
        self.assertEqual(body["language"], "km+en")
        self.assertEqual(body["status"], "completed")
        self.assertEqual(set(body), {
            "document_id", "filename", "extracted_text", "confidence", "language",
            "status", "processing_time", "created_at", "details",
        })
        self.assertEqual(body["details"][0]["box"], [[10, 20], [110, 20], [110, 35], [10, 35]])

    def test_invalid_upload_extension_keeps_validation_response(self):
        response = TestClient(app).post(
            "/api/ocr/extract", files={"file": ("scan.pdf", b"bad", "application/pdf")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file format", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
