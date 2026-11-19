
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

function addField(parent, labelText, value, rows = 3) {
    const wrapper = document.createElement("div");
    wrapper.style.marginTop = "15px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.display = "block";
    label.style.marginBottom = "8px";

    const textarea = document.createElement("textarea");
    textarea.value = value || "";
    textarea.rows = rows;
    textarea.maxLength = 4000;
    textarea.style.width = "100%";
    textarea.style.padding = "12px";
    textarea.style.border = "1px solid #c9beb1";
    textarea.style.borderRadius = "5px";
    textarea.style.background = "#fff";
    textarea.style.color = "#222";
    textarea.style.boxSizing = "border-box";

    wrapper.appendChild(label);
    wrapper.appendChild(textarea);
    parent.appendChild(wrapper);

    return textarea;
}

function makeGreeting(consultation) {
    const name = consultation.name || "there";
    const concern = consultation.concern || "your skin concerns";

    return (
        "Hi " + name + ", this is your nurse practitioner, " +
        "Eva Israilova, from Aesthetic Island.\n\n" +
        "I see you're looking to improve " + concern + ". " +
        "Thank you for sharing your concerns with us.\n\n" +
        "Based on the information you provided, " +
        "here are some treatment options we can discuss. " +
        "A professional consultation is needed to determine " +
        "which treatment is right for you.\n\n" +
        "I look forward to helping you reach your goals!\n\n" +
        "Eva Israilova, NP"
    );
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

        if (consultation.details) {
            addText(card, "p", "Patient's message: " + consultation.details);
        }

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

        // EXISTING STATUS CONTROLS
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

        const statusButton = document.createElement("button");
        statusButton.textContent = "Save Status";

        const statusMessage = document.createElement("p");
        statusMessage.className = "saveMessage";

        statusButton.addEventListener("click", async function() {
            statusButton.disabled = true;
            statusMessage.textContent = "Saving...";

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
                statusMessage.textContent = error.message;
                statusButton.disabled = false;
            }
        });

        controls.appendChild(select);
        controls.appendChild(statusButton);
        card.appendChild(controls);
        card.appendChild(statusMessage);

        // NEW NP REVIEW SECTION
        const reviewBox = document.createElement("div");
        reviewBox.style.marginTop = "25px";
        reviewBox.style.padding = "20px";
        reviewBox.style.border = "1px solid #d8cec1";
        reviewBox.style.background = "#f5f0e9";
        reviewBox.style.borderRadius = "8px";

        addText(reviewBox, "h3", "Eva's Personalized Review");

        addText(
            reviewBox,
            "p",
            "Write a message, recommend treatments, and enter prices."
        );

        const greetingField = addField(
            reviewBox,
            "Message to Patient",
            consultation.np_message || "",
            7
        );

        const generateButton = document.createElement("button");
        generateButton.textContent = "Generate Greeting";
        generateButton.type = "button";
        generateButton.style.marginTop = "10px";

        generateButton.addEventListener("click", function() {
            if (greetingField.value.trim()) {
                const confirmed = window.confirm(
                    "Replace the current message with a new greeting?"
                );

                if (!confirmed) {
                    return;
                }
            }

            greetingField.value = makeGreeting(consultation);
        });

        reviewBox.appendChild(generateButton);

        const treatmentsField = addField(
            reviewBox,
            "Recommended Treatments",
            consultation.np_treatments || "",
            4
        );

        const pricesField = addField(
            reviewBox,
            "Treatment Prices",
            consultation.np_prices || "",
            3
        );

        const saveReviewButton = document.createElement("button");
        saveReviewButton.textContent = "Save Review";
        saveReviewButton.type = "button";
        saveReviewButton.style.marginTop = "18px";

        const reviewMessage = document.createElement("p");
        reviewMessage.className = "saveMessage";

        saveReviewButton.addEventListener("click", async function() {
            saveReviewButton.disabled = true;
            reviewMessage.textContent = "Saving review...";

            try {
                const response = await fetch(
                    "/api/consultations/" + consultation.id + "/review",
                    {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            message: greetingField.value.trim(),
                            treatments: treatmentsField.value.trim(),
                            prices: pricesField.value.trim()
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Could not save review.");
                }

                consultation.np_message = greetingField.value.trim();
                consultation.np_treatments = treatmentsField.value.trim();
                consultation.np_prices = pricesField.value.trim();
                consultation.status = "Reviewed";

                showConsultations();

            } catch (error) {
                reviewMessage.textContent = error.message;
                saveReviewButton.disabled = false;
            }
        });

        reviewBox.appendChild(saveReviewButton);
        reviewBox.appendChild(reviewMessage);

        card.appendChild(reviewBox);
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
