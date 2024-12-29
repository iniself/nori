import frappe


def has_app_permission():
    user = frappe.session.user
    if user != "Guest":
        return True
