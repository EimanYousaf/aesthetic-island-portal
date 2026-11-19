
const form = document.getElementById("clientForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("submitButton");
const resultCard = document.getElementById("resultCard");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const photo = document.getElementById("photo").files[0];

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
