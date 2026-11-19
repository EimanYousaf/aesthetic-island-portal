
const form = document.getElementById("clientForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("submitButton");
const resultCard = document.getElementById("resultCard");
const copyButton = document.getElementById("copyAccessCode");

let currentAccessCode = "";

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const photo = document.getElementById("photo").files[0];
    const concern = document.getElementById("concern").value;
    const details = document.getElementById("details").value.trim();

    if (concern === "other" && !details) {
        message.textContent = "Please describe your concern.";
        return;
    }

    if (photo && photo.size > 5 * 1024 * 1024) {
        message.textContent = "Photo must be smaller than 5 MB.";
        return;
    }

    button.disabled = true;
    button.textContent = "SUBMITTING...";
    message.textContent = "";
    resultCard.hidden = true;

    try {
        const response = await fetch("/api/consultation", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Submission failed.");
        }

        document.getElementById("resultId").textContent =
            "Consultation #" + data.id;

        document.getElementById("resultTreatment").textContent =
            data.treatment;

        currentAccessCode = data.access_code || "";

        document.getElementById("accessCode").textContent =
            currentAccessCode || "Access code unavailable";

        copyButton.disabled = !currentAccessCode;

        resultCard.hidden = false;
        form.reset();

        resultCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {
        message.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = "SUBMIT CONSULTATION";
    }
});

copyButton.addEventListener("click", async function() {
    if (!currentAccessCode) {
        return;
    }

    try {
        await navigator.clipboard.writeText(currentAccessCode);
        copyButton.textContent = "COPIED!";
    } catch (error) {
        copyButton.textContent = "SELECT AND COPY THE CODE ABOVE";
    }
});
