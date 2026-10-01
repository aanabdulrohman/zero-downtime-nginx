from fastapi import FastAPI
import os

app = FastAPI()

APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "blue")

@app.get("/")
def read_root():
  return {
    "message" : "Hi there! This is demo for zero downtime deployment",
    "version" : APP_VERSION,
    "environment" : ENVIRONMENT,
    "status" : "healthy"
  }

@app.get("/health")
def health_check():
  return {"status" : "oke", "version" : APP_VERSION}