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

    def test_health_check_endpoint(self):
        client = TestClient(app)
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("supported_languages", data)
        self.assertIn("en", data["supported_languages"])

    def test_cors_preflight_for_vercel_frontend(self):
        client = TestClient(app)
        response = client.options(
            "/api/ocr/extract",
            headers={
                "Origin": "https://ocr-g3tg.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "https://ocr-g3tg.vercel.app",
        )

    def test_cors_preflight_for_vercel_preview(self):
        client = TestClient(app)
        response = client.options(
            "/api/ocr/extract",
            headers={
                "Origin": "https://ocr-preview-branch-test.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "https://ocr-preview-branch-test.vercel.app",
        )

    def test_cors_preflight_rejects_unauthorized_origin(self):
        client = TestClient(app)
        response = client.options(
            "/api/ocr/extract",
            headers={
                "Origin": "https://malicious-site.example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertNotEqual(
            response.headers.get("access-control-allow-origin"),
            "https://malicious-site.example.com",
        )

    def test_empty_file_upload_rejected(self):
        client = TestClient(app)
        response = client.post(
            "/api/ocr/extract",
            files={"file": ("empty.png", b"", "image/png")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("empty", response.json()["detail"].lower())

    def test_document_not_found(self):
        client = TestClient(app)
        response = client.get("/api/ocr/non-existent-uuid")
        self.assertEqual(response.status_code, 404)

    def test_history_endpoint(self):
        client = TestClient(app)
        response = client.get("/api/ocr/history")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total", data)
        self.assertIn("items", data)


if __name__ == "__main__":
    unittest.main()
