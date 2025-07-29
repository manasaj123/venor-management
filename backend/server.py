from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
import os
import uuid
from datetime import datetime
import pymongo
from pymongo import MongoClient
import csv
import io
import re

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/vendordb')
client = MongoClient(MONGO_URL)
db = client.vendordb
vendors_collection = db.vendors
counter_collection = db.counters

# Initialize vendor counter
def initialize_counter():
    if counter_collection.find_one({"_id": "vendor_counter"}) is None:
        counter_collection.insert_one({"_id": "vendor_counter", "sequence_value": 0})

initialize_counter()

def get_next_vendor_id():
    counter = counter_collection.find_one_and_update(
        {"_id": "vendor_counter"},
        {"$inc": {"sequence_value": 1}},
        return_document=pymongo.ReturnDocument.AFTER,
        upsert=True
    )
    return f"VENDOR{counter['sequence_value']:03d}"

# Validation functions
def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    # Basic phone validation - can be enhanced
    pattern = r'^\+?[\d\s\-\(\)]{7,20}$'
    return re.match(pattern, phone) is not None

def validate_iban(iban: str) -> bool:
    # Basic IBAN validation - starts with country code and length check
    pattern = r'^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$'
    return re.match(pattern, iban.upper()) is not None

def validate_postal_code(postal_code: str, country: str) -> bool:
    # Basic postal code validation for common countries
    patterns = {
        'United States': r'^\d{5}(-\d{4})?$',
        'India': r'^\d{6}$',
        'United Kingdom': r'^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$',
        'Canada': r'^[A-Z]\d[A-Z]\s?\d[A-Z]\d$',
        'Germany': r'^\d{5}$',
        'France': r'^\d{5}$',
    }
    
    if country in patterns:
        return re.match(patterns[country], postal_code.upper()) is not None
    return len(postal_code) >= 3  # Generic validation for other countries

# Pydantic models
class VendorCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: str
    street_address: str
    city: str
    postal_code: str
    country: str
    bank_name: str
    account_number: str
    iban: str
    bic: str
    documents: Optional[dict] = None

    @validator('company_name')
    def validate_company_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Company name must be at least 2 characters long')
        return v.strip()

    @validator('contact_person')
    def validate_contact_person(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Contact person name must be at least 2 characters long')
        return v.strip()

    @validator('email')
    def validate_email_format(cls, v):
        if not validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower()

    @validator('phone')
    def validate_phone_format(cls, v):
        if not validate_phone(v):
            raise ValueError('Invalid phone number format')
        return v.strip()

    @validator('postal_code')
    def validate_postal_code_format(cls, v, values):
        country = values.get('country', '')
        if not validate_postal_code(v, country):
            raise ValueError('Invalid postal code format for selected country')
        return v.strip()

    @validator('iban')
    def validate_iban_format(cls, v):
        if not validate_iban(v):
            raise ValueError('Invalid IBAN format')
        return v.upper().replace(' ', '')

    @validator('bic')
    def validate_bic_format(cls, v):
        # Basic BIC validation - 8 or 11 characters
        if not re.match(r'^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$', v.upper()):
            raise ValueError('Invalid BIC format')
        return v.upper()

class VendorUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    iban: Optional[str] = None
    bic: Optional[str] = None
    documents: Optional[dict] = None
    status: Optional[str] = None

    @validator('company_name')
    def validate_company_name(cls, v):
        if v is not None and (not v or len(v.strip()) < 2):
            raise ValueError('Company name must be at least 2 characters long')
        return v.strip() if v else v

    @validator('contact_person')
    def validate_contact_person(cls, v):
        if v is not None and (not v or len(v.strip()) < 2):
            raise ValueError('Contact person name must be at least 2 characters long')
        return v.strip() if v else v

    @validator('email')
    def validate_email_format(cls, v):
        if v is not None and not validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower() if v else v

    @validator('phone')
    def validate_phone_format(cls, v):
        if v is not None and not validate_phone(v):
            raise ValueError('Invalid phone number format')
        return v.strip() if v else v

    @validator('iban')
    def validate_iban_format(cls, v):
        if v is not None and not validate_iban(v):
            raise ValueError('Invalid IBAN format')
        return v.upper().replace(' ', '') if v else v

    @validator('bic')
    def validate_bic_format(cls, v):
        if v is not None and not re.match(r'^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$', v.upper()):
            raise ValueError('Invalid BIC format')
        return v.upper() if v else v

class VendorResponse(BaseModel):
    id: str
    vendor_id: str
    company_name: str
    contact_person: str
    email: str
    phone: str
    street_address: str
    city: str
    postal_code: str
    country: str
    bank_name: str
    account_number: str
    iban: str
    bic: str
    documents: Optional[dict] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

@app.get("/")
async def root():
    return {"message": "Vendor Management System API"}

@app.get("/api/vendors")
async def get_vendors(
    search: Optional[str] = Query(None, description="Search by vendor ID, company name, contact person, or email"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status"),
    created_after: Optional[str] = Query(None, description="Filter by creation date (YYYY-MM-DD)"),
    created_before: Optional[str] = Query(None, description="Filter by creation date (YYYY-MM-DD)"),
    limit: Optional[int] = Query(100, description="Limit number of results"),
    offset: Optional[int] = Query(0, description="Offset for pagination")
):
    try:
        # Build query
        query = {}
        
        # Search functionality
        if search:
            search_regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"vendor_id": search_regex},
                {"company_name": search_regex},
                {"contact_person": search_regex},
                {"email": search_regex}
            ]
        
        # Filters
        if country:
            query["country"] = country
        if status:
            query["status"] = status
        
        # Date filters
        if created_after or created_before:
            date_query = {}
            if created_after:
                date_query["$gte"] = datetime.strptime(created_after, "%Y-%m-%d")
            if created_before:
                date_query["$lte"] = datetime.strptime(created_before, "%Y-%m-%d")
            query["created_at"] = date_query
        
        # Get total count
        total_count = vendors_collection.count_documents(query)
        
        # Get vendors with pagination
        vendors = list(vendors_collection.find(query).skip(offset).limit(limit).sort("created_at", -1))
        
        for vendor in vendors:
            vendor["_id"] = str(vendor["_id"])
        
        # Get unique countries and statuses for filter options
        countries = vendors_collection.distinct("country")
        statuses = vendors_collection.distinct("status")
        
        return {
            "vendors": vendors,
            "total_count": total_count,
            "filter_options": {
                "countries": countries,
                "statuses": statuses
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vendors")
async def create_vendor(vendor: VendorCreate):
    try:
        vendor_id = get_next_vendor_id()
        vendor_data = {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "company_name": vendor.company_name,
            "contact_person": vendor.contact_person,
            "email": vendor.email,
            "phone": vendor.phone,
            "street_address": vendor.street_address,
            "city": vendor.city,
            "postal_code": vendor.postal_code,
            "country": vendor.country,
            "bank_name": vendor.bank_name,
            "account_number": vendor.account_number,
            "iban": vendor.iban,
            "bic": vendor.bic,
            "documents": vendor.documents or {},
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": None
        }
        
        result = vendors_collection.insert_one(vendor_data)
        vendor_data["_id"] = str(result.inserted_id)
        
        return {"message": "Vendor created successfully", "vendor": vendor_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vendors/{vendor_id}")
async def get_vendor(vendor_id: str):
    try:
        vendor = vendors_collection.find_one({"vendor_id": vendor_id})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        vendor["_id"] = str(vendor["_id"])
        return {"vendor": vendor}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/vendors/{vendor_id}")
async def update_vendor(vendor_id: str, vendor_update: VendorUpdate):
    try:
        vendor = vendors_collection.find_one({"vendor_id": vendor_id})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Prepare update data
        update_data = {k: v for k, v in vendor_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Update vendor
        result = vendors_collection.update_one(
            {"vendor_id": vendor_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")
        
        # Get updated vendor
        updated_vendor = vendors_collection.find_one({"vendor_id": vendor_id})
        updated_vendor["_id"] = str(updated_vendor["_id"])
        
        return {"message": "Vendor updated successfully", "vendor": updated_vendor}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str):
    try:
        result = vendors_collection.delete_one({"vendor_id": vendor_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return {"message": "Vendor deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/next-vendor-id")
async def get_next_vendor_id_preview():
    try:
        # Get current counter without incrementing
        counter = counter_collection.find_one({"_id": "vendor_counter"})
        if counter:
            next_id = f"VENDOR{counter['sequence_value'] + 1:03d}"
        else:
            next_id = "VENDOR001"
        return {"next_vendor_id": next_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vendors/export/csv")
async def export_vendors_csv(
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    created_after: Optional[str] = Query(None),
    created_before: Optional[str] = Query(None)
):
    try:
        # Build query (reuse filtering logic)
        query = {}
        
        if search:
            search_regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"vendor_id": search_regex},
                {"company_name": search_regex},
                {"contact_person": search_regex},
                {"email": search_regex}
            ]
        
        if country:
            query["country"] = country
        if status:
            query["status"] = status
        
        if created_after or created_before:
            date_query = {}
            if created_after:
                date_query["$gte"] = datetime.strptime(created_after, "%Y-%m-%d")
            if created_before:
                date_query["$lte"] = datetime.strptime(created_before, "%Y-%m-%d")
            query["created_at"] = date_query
        
        # Get vendors
        vendors = list(vendors_collection.find(query).sort("created_at", -1))
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = [
            'Vendor ID', 'Company Name', 'Contact Person', 'Email', 'Phone',
            'Street Address', 'City', 'Postal Code', 'Country',
            'Bank Name', 'Account Number', 'IBAN', 'BIC', 'Status',
            'Created At', 'Updated At'
        ]
        writer.writerow(headers)
        
        # Write data
        for vendor in vendors:
            writer.writerow([
                vendor.get('vendor_id', ''),
                vendor.get('company_name', ''),
                vendor.get('contact_person', ''),
                vendor.get('email', ''),
                vendor.get('phone', ''),
                vendor.get('street_address', ''),
                vendor.get('city', ''),
                vendor.get('postal_code', ''),
                vendor.get('country', ''),
                vendor.get('bank_name', ''),
                vendor.get('account_number', ''),
                vendor.get('iban', ''),
                vendor.get('bic', ''),
                vendor.get('status', ''),
                vendor.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if vendor.get('created_at') else '',
                vendor.get('updated_at', '').strftime('%Y-%m-%d %H:%M:%S') if vendor.get('updated_at') else ''
            ])
        
        output.seek(0)
        
        # Return as streaming response
        return StreamingResponse(
            io.StringIO(output.getvalue()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=vendors_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vendors/stats")
async def get_vendor_stats():
    try:
        total_vendors = vendors_collection.count_documents({})
        active_vendors = vendors_collection.count_documents({"status": "active"})
        inactive_vendors = vendors_collection.count_documents({"status": "inactive"})
        
        # Country distribution
        country_pipeline = [
            {"$group": {"_id": "$country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        country_stats = list(vendors_collection.aggregate(country_pipeline))
        
        # Recent vendors (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_vendors = vendors_collection.count_documents({
            "created_at": {"$gte": thirty_days_ago}
        })
        
        return {
            "total_vendors": total_vendors,
            "active_vendors": active_vendors,
            "inactive_vendors": inactive_vendors,
            "recent_vendors": recent_vendors,
            "country_distribution": country_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)