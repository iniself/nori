import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def before_uninstall():
    # remove user number
    if frappe.db.exists("Custom Field", "User-user_number"):
        frappe.delete_doc("Custom Field", "User-user_number", force=1)

    fields_to_hide = ["middle_name", "last_name", "full_name"]

    # undo customize user doctype
    for field in fields_to_hide:
        setters = frappe.get_all(
            "Property Setter",
            filters={
                "doc_type": "User",
                "field_name": field,
                "property": "hidden",
                "value": "1",
            },
            pluck="name",
        )

        for ps in setters:
            frappe.delete_doc("Property Setter", ps, force=1)
            
    # retore frappe settings
    website_settings = frappe.get_single("Website Settings")
    if website_settings.favicon == "/assets/nori/img/favicon-96x96.png":
        website_settings.favicon = None
        
    if website_settings.home_page == "/apps":
        website_settings.home_page = None
        
    if website_settings.app_name == "Nori":
        website_settings.app_name = "Frappe"
        
    if website_settings.app_logo == "/assets/nori/img/nori.png":
        website_settings.app_logo = None
        
    if website_settings.banner_image == "/assets/nori/img/nori.png":
        website_settings.banner_image = None
        
    if website_settings.splash_image == "/assets/nori/img/nori.png":
        website_settings.splash_image = None
        
    if website_settings.brand_html == "<img src='/assets/nori/img/nori.png'>":
        website_settings.brand_html = None
        
    if website_settings.footer_powered == "Nori @2025":
        website_settings.footer_powered = None
    
    website_settings.save()

    system_settings = frappe.get_single("System Settings")
    if system_settings.enable_onboarding == 0:
        system_settings.enable_onboarding = 1
    
    if system_settings.disable_system_update_notification == 1:
        system_settings.disable_system_update_notification = 0
        
    if system_settings.disable_change_log_notification == 1:
        system_settings.disable_change_log_notification = 0
        
    if system_settings.first_day_of_the_week == "Monday":
        system_settings.first_day_of_the_week = "Sunday"
        
    if system_settings.rounding_method == "Commercial Rounding":
        system_settings.rounding_method = "Banker's Rounding"
        
    if system_settings.float_precision == "2":
        system_settings.float_precision = ""
        
    if system_settings.currency_precision == "2":
        system_settings.currency_precision = ""
    system_settings.save()                