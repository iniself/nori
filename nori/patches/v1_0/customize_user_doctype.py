import frappe


def execute():
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
