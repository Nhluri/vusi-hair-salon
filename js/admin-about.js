const about = getAboutDetails();

document.getElementById("aboutTitle").value = about.title;
document.getElementById("aboutStory").value = about.story;
document.getElementById("aboutMission").value = about.mission;
document.getElementById("aboutFounded").value = about.founded;
document.getElementById("aboutClients").value = about.clients;
document.getElementById("aboutLooks").value = about.looks;

document.getElementById("aboutForm").addEventListener("submit", function (event) {
    event.preventDefault();

    saveContent("siteAbout", {
        title: document.getElementById("aboutTitle").value.trim(),
        story: document.getElementById("aboutStory").value.trim(),
        mission: document.getElementById("aboutMission").value.trim(),
        founded: document.getElementById("aboutFounded").value.trim(),
        clients: document.getElementById("aboutClients").value.trim(),
        looks: document.getElementById("aboutLooks").value.trim()
    });

    alert("About page updated");
});