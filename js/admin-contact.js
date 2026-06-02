const contact = getContactDetails();

document.getElementById("phone").value = contact.phone;
document.getElementById("email").value = contact.email;
document.getElementById("address").value = contact.address;
document.getElementById("hours").value = contact.hours;
document.getElementById("whatsapp").value = contact.whatsapp;

document.getElementById("contactForm").addEventListener("submit", function (event) {
    event.preventDefault();

    saveContent("siteContact", {
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim(),
        hours: document.getElementById("hours").value.trim(),
        whatsapp: document.getElementById("whatsapp").value.trim()
    });

    alert("Contact details updated");
});