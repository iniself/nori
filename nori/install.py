import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def after_install():
    
    # add user number
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
    
    # customize user doctype
    frappe.get_doc(
        {
            "doctype": "Property Setter",
            "doctype_or_field": "DocField",
            "doc_type": "User",
            "field_name": "middle_name",
            "property": "hidden",
            "value": 1,
        }
    ).insert(ignore_permissions=True)

    frappe.get_doc(
        {
            "doctype": "Property Setter",
            "doctype_or_field": "DocField",
            "doc_type": "User",
            "field_name": "last_name",
            "property": "hidden",
            "value": 1,
        }
    ).insert(ignore_permissions=True)

    frappe.get_doc(
        {
            "doctype": "Property Setter",
            "doctype_or_field": "DocField",
            "doc_type": "User",
            "field_name": "full_name",
            "property": "hidden",
            "value": 1,
        }
    ).insert(ignore_permissions=True)
    
    # init nori settings
    website_settings = frappe.get_single("Website Settings")
    website_settings.favicon = "/assets/nori/img/favicon-96x96.png"
    website_settings.home_page = "/apps"
    website_settings.app_name = "Nori"
    website_settings.app_logo = "/assets/nori/img/nori.png"
    website_settings.banner_image = "/assets/nori/img/nori.png"
    website_settings.splash_image = "/assets/nori/img/nori.png"
    website_settings.brand_html = "<img src='/assets/nori/img/nori.png'>"
    website_settings.footer_powered = "Nori @2025"
    website_settings.save()

    system_settings = frappe.get_single("System Settings")
    system_settings.enable_onboarding = 0
    system_settings.disable_system_update_notification = 1
    system_settings.disable_change_log_notification = 1
    system_settings.first_day_of_the_week = "Monday"
    system_settings.rounding_method = "Commercial Rounding"
    system_settings.float_precision = 2
    system_settings.currency_precision = 2
    system_settings.save()    