// hide the "support" button etc.

frappe.provide('frappe.help');
$(document).ready(function() {
    const allowedRoles = [];
    const hasAllowedRole = allowedRoles.some(role => frappe.user.has_role(role));    
    if (!hasAllowedRole){
        $('button[onclick="return frappe.ui.toolbar.show_about()"]').remove();
        $('a[href="/app/system-health-report"]').remove();
        $('a[href="https://frappe.io/support"]').remove();
    }
});
