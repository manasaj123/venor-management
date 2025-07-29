#!/usr/bin/env python3
"""
Backend API Testing for Vendor Management System
Tests all CRUD operations and validates responses
"""

import requests
import json
import sys
from datetime import datetime

class VendorAPITester:
    def __init__(self, base_url="https://d37bd3f3-2fe3-43d1-ac2e-917e598068d4.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_vendor_id = None

    def log_test(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED {details}")
        else:
            print(f"❌ {test_name} - FAILED {details}")
        return success

    def test_root_endpoint(self):
        """Test the root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            return self.log_test("Root Endpoint", success, details)
        except Exception as e:
            return self.log_test("Root Endpoint", False, f"Error: {str(e)}")

    def test_get_vendors_empty(self):
        """Test GET /api/vendors (should return empty array initially)"""
        try:
            response = requests.get(f"{self.base_url}/api/vendors", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                vendors = data.get('vendors', [])
                details += f", Vendors count: {len(vendors)}"
                # Note: May not be empty if vendors already exist
                
            return self.log_test("GET Vendors (Initial)", success, details)
        except Exception as e:
            return self.log_test("GET Vendors (Initial)", False, f"Error: {str(e)}")

    def test_get_next_vendor_id(self):
        """Test GET /api/next-vendor-id"""
        try:
            response = requests.get(f"{self.base_url}/api/next-vendor-id", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                next_id = data.get('next_vendor_id', '')
                details += f", Next ID: {next_id}"
                success = next_id.startswith('VENDOR') and len(next_id) == 9  # VENDOR001 format
                if not success:
                    details += " (Invalid format)"
                    
            return self.log_test("GET Next Vendor ID", success, details)
        except Exception as e:
            return self.log_test("GET Next Vendor ID", False, f"Error: {str(e)}")

    def test_create_vendor(self):
        """Test POST /api/vendors with test data"""
        test_vendor = {
            "company_name": "TechCorp Solutions",
            "contact_person": "John Smith",
            "email": "john@techcorp.com",
            "phone": "+1234567890",
            "street_address": "123 Business St",
            "city": "New York",
            "postal_code": "10001",
            "country": "United States",
            "bank_name": "Chase Bank",
            "account_number": "1234567890",
            "iban": "US123456789012345678",
            "bic": "CHASUS33"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/vendors",
                json=test_vendor,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                vendor = data.get('vendor', {})
                self.created_vendor_id = vendor.get('vendor_id', '')
                details += f", Created Vendor ID: {self.created_vendor_id}"
                details += f", Company: {vendor.get('company_name', 'N/A')}"
                
                # Validate required fields are present
                required_fields = ['id', 'vendor_id', 'company_name', 'email', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in vendor]
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            return self.log_test("POST Create Vendor", success, details)
        except Exception as e:
            return self.log_test("POST Create Vendor", False, f"Error: {str(e)}")

    def test_get_vendors_after_creation(self):
        """Test GET /api/vendors after creating a vendor"""
        try:
            response = requests.get(f"{self.base_url}/api/vendors", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                vendors = data.get('vendors', [])
                details += f", Vendors count: {len(vendors)}"
                
                # Check if our created vendor is in the list
                if self.created_vendor_id:
                    found_vendor = any(v.get('vendor_id') == self.created_vendor_id for v in vendors)
                    details += f", Created vendor found: {found_vendor}"
                    if not found_vendor:
                        success = False
                        details += " (Created vendor not in list)"
                        
            return self.log_test("GET Vendors (After Creation)", success, details)
        except Exception as e:
            return self.log_test("GET Vendors (After Creation)", False, f"Error: {str(e)}")

    def test_get_specific_vendor(self):
        """Test GET /api/vendors/{vendor_id}"""
        if not self.created_vendor_id:
            return self.log_test("GET Specific Vendor", False, "No vendor ID available")
            
        try:
            response = requests.get(f"{self.base_url}/api/vendors/{self.created_vendor_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                vendor = data.get('vendor', {})
                details += f", Vendor ID: {vendor.get('vendor_id', 'N/A')}"
                details += f", Company: {vendor.get('company_name', 'N/A')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            return self.log_test("GET Specific Vendor", success, details)
        except Exception as e:
            return self.log_test("GET Specific Vendor", False, f"Error: {str(e)}")

    def test_create_vendor_invalid_data(self):
        """Test POST /api/vendors with invalid data"""
        invalid_vendor = {
            "company_name": "",  # Empty required field
            "email": "invalid-email"  # Invalid email format
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/vendors",
                json=invalid_vendor,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            # Should fail with 422 (validation error) or 400 (bad request)
            success = response.status_code in [400, 422]
            details = f"Status: {response.status_code}"
            
            if not success:
                details += " (Expected 400 or 422 for invalid data)"
                
            return self.log_test("POST Invalid Vendor Data", success, details)
        except Exception as e:
            return self.log_test("POST Invalid Vendor Data", False, f"Error: {str(e)}")

    def test_get_nonexistent_vendor(self):
        """Test GET /api/vendors/{vendor_id} with non-existent ID"""
        try:
            response = requests.get(f"{self.base_url}/api/vendors/VENDOR999", timeout=10)
            success = response.status_code == 404
            details = f"Status: {response.status_code}"
            
            if not success:
                details += " (Expected 404 for non-existent vendor)"
                
            return self.log_test("GET Non-existent Vendor", success, details)
        except Exception as e:
            return self.log_test("GET Non-existent Vendor", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Vendor Management System API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        self.test_root_endpoint()
        self.test_get_vendors_empty()
        self.test_get_next_vendor_id()
        self.test_create_vendor()
        self.test_get_vendors_after_creation()
        self.test_get_specific_vendor()
        self.test_create_vendor_invalid_data()
        self.test_get_nonexistent_vendor()
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test runner"""
    tester = VendorAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())