
let consultations = [];

const list = document.getElementById("consultationList");
const filter = document.getElementById("statusFilter");

async function loadConsultations() {
    try {
        const response = await fetch("/api/consultations");

        if (response.status === 401) {
            window.location.href = "/dashboard.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load consultations.");
        }

        consultations = await response.json();
        showConsultations();

    } catch (error) {
        list.textContent = error.message;
    }
}

function updateCounts() {
    document.getElementById("totalCount").textContent =
        consultations.length;

    for (const status of ["Pending", "Reviewed", "Completed"]) {
        const count = consultations.filter(
            item => item.status === status
        ).length;

        document.getElementById(
            status.toLowerCase() + "Count"
        ).textContent = count;
    }
}

function addText(parent, tag, content) {
    const element = document.createElement(tag);
    element.textContent = content;
    parent.appendChild(element);
    return element;
}

function showConsultations() {
    updateCounts();
    list.replaceChildren();

    const selected = filter.value;
    const visible = consultations.filter(
        item => selected === "All" || item.status === selected
    );

    if (visible.length === 0) {
        addText(list, "p", "No consultations found.");
        return;
    }

    for (const consultation of visible) {
        const card = document.createElement("article");
        card.className = "consultationCard";

        const top = document.createElement("div");
        top.className = "cardTop";

        addText(top, "h3", "Consultation #" + consultation.id);

        const badge = addText(top, "span", consultation.status);
        badge.className = "statusBadge";

        card.appendChild(top);

        addText(card, "p", "Name: " + (consultation.name || "Test entry"));
        addText(card, "p", "Phone: " + (consultation.phone || "Not provided"));
        addText(card, "p", "Concern: " + consultation.concern);
        addText(card, "p", "Treatment information: " + consultation.treatment);

        if (consultation.created_at) {
            addText(card, "p", "Submitted: " + consultation.created_at + " UTC");
        }

        if (consultation.photo) {
            const photoLink = document.createElement("a");
            photoLink.href = "/api/photos/" + consultation.id;
            photoLink.target = "_blank";
            photoLink.rel = "noopener";
            photoLink.textContent = "View submitted photo";
            card.appendChild(photoLink);
        }

        const controls = document.createElement("div");
        controls.className = "statusControls";

        const select = document.createElement("select");

        for (const status of ["Pending", "Reviewed", "Completed"]) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        }

        select.value = consultation.status;

        const button = document.createElement("button");
        button.textContent = "Save Status";

        const message = document.createElement("p");
        message.className = "saveMessage";

        button.addEventListener("click", async function() {
            button.disabled = true;
            message.textContent = "Saving...";

            try {
                const response = await fetch(
                    "/api/consultations/" + consultation.id + "/status",
                    {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({status: select.value})
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Update failed.");
                }

                consultation.status = result.status;
                showConsultations();

            } catch (error) {
                message.textContent = error.message;
                button.disabled = false;
            }
        });

        controls.appendChild(select);
        controls.appendChild(button);
        card.appendChild(controls);
        card.appendChild(message);
        list.appendChild(card);
    }
}

filter.addEventListener("change", showConsultations);

document.getElementById("logoutButton").addEventListener(
    "click", async function() {
        await fetch("/api/logout", {method: "POST"});
        window.location.href = "/";
    }
);

loadConsultations();
