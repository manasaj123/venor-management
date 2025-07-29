from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
import uuid
from datetime import datetime
import pymongo
from pymongo import MongoClient

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

@app.get("/")
async def root():
    return {"message": "Vendor Management System API"}

@app.get("/api/vendors")
async def get_vendors():
    try:
        vendors = list(vendors_collection.find())
        for vendor in vendors:
            vendor["_id"] = str(vendor["_id"])
        return {"vendors": vendors}
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
            "created_at": datetime.utcnow()
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str):
    try:
        result = vendors_collection.delete_one({"vendor_id": vendor_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return {"message": "Vendor deleted successfully"}
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)