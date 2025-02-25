# add_user_number.py
import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def execute():
    user_number = {
        "User": {
            "fieldname": "user_number",
            "label": "User Number",
            "fieldtype": "Data",
            "insert_after": "username",
            "unique": 1,
        }
    }
    create_custom_fields(user_number)
