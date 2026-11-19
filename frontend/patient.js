
const loginForm = document.getElementById("patientLoginForm");
const loginSection = document.getElementById("loginSection");
const consultationSection = document.getElementById("consultationSection");
const loginError = document.getElementById("loginError");
const consultationError = document.getElementById("consultationError");
const loginButton = document.getElementById("loginButton");

const bookingLink = document.getElementById("bookingLink");

const BOOKING_URL = "https://www.joinblvd.com/b/aesthticisland/widget#/visit-type";

async function loadConsultation() {
    consultationError.textContent = "";

    try {
        const response = await fetch("/api/patient/consultation", {
            credentials: "same-origin",
            cache: "no-store"
        });

        const data = await response.json();

        if (response.status === 401) {
            consultationSection.hidden = true;
            loginSection.hidden = false;
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Could not load consultation.");
        }

        loginSection.hidden = true;
        consultationSection.hidden = false;

        document.getElementById("welcomeName").textContent =
            "Welcome, " + (data.name || "Client");

        document.getElementById("patientStatus").textContent =
            data.status || "Pending";

        document.getElementById("patientConcern").textContent =
            data.concern || "Not provided";

        document.getElementById("patientDetails").textContent =
            data.details || "No additional message provided.";

        const hasReview = Boolean(
            data.np_message && data.np_treatments
        );

        document.getElementById("pendingSection").hidden = hasReview;
        document.getElementById("reviewSection").hidden = !hasReview;

        if (hasReview) {
            document.getElementById("evaMessage").textContent =
                data.np_message;

            document.getElementById("evaTreatments").textContent =
                data.np_treatments;

            document.getElementById("evaPrices").textContent =
                data.np_prices || "Please contact us for pricing.";
        }

        if (hasReview && BOOKING_URL) {
            bookingLink.href = BOOKING_URL;
            bookingLink.hidden = false;
        } else {
            bookingLink.hidden = true;
        }

    } catch (error) {
        consultationError.textContent = error.message;
    }
}

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    loginError.textContent = "";
    loginButton.disabled = true;
    loginButton.textContent = "SIGNING IN...";

    try {
        const response = await fetch("/api/patient/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                phone: document.getElementById("patientPhone").value,
                access_code: document.getElementById("patientCode").value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed.");
        }

        document.getElementById("patientCode").value = "";
        await loadConsultation();

    } catch (error) {
        loginError.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "VIEW MY CONSULTATION";
    }
});

document.getElementById("refreshButton").addEventListener(
    "click",
    loadConsultation
);

document.getElementById("logoutButton").addEventListener(
    "click",
    async function() {
        try {
            await fetch("/api/logout", {
                method: "POST",
                credentials: "same-origin"
            });
        } finally {
            consultationSection.hidden = true;
            loginSection.hidden = false;
            loginForm.reset();
        }
    }
);

loadConsultation();
