
// get my test consultations
async function loadConsultations() {

    const list = document.getElementById("consultationList");

    try {

        // get saved consultations from python
        const response = await fetch("/api/consultations");

        if (!response.ok) {
            throw new Error("could not load consultations");
        }

        const consultations = await response.json();

        // clear old information
        list.textContent = "";

        if (consultations.length === 0) {
            list.textContent = "No test consultations yet.";
            return;
        }

        // show each consultation
        for (const consultation of consultations) {

            const box = document.createElement("div");

            box.style.border = "1px solid #cccccc";
            box.style.padding = "20px";
            box.style.marginBottom = "20px";
            box.style.borderRadius = "8px";

            const title = document.createElement("h3");
            title.textContent = "Consultation #" + consultation.id;

            const concern = document.createElement("p");
            concern.textContent = "Concern: " + consultation.concern;

            const treatment = document.createElement("p");
            treatment.textContent = "Treatment Information: " + consultation.treatment;

            const status = document.createElement("p");
            status.textContent = "Status: " + consultation.status;

            // create a dropdown for changing status
            const statusSelect = document.createElement("select");

            const options = ["Pending", "Reviewed", "Completed"];

            for (const option of options) {

                const item = document.createElement("option");

                item.value = option;
                item.textContent = option;

                statusSelect.appendChild(item);
            }

            // select the saved status
            statusSelect.value = consultation.status;

            // create the update button
            const button = document.createElement("button");
            button.textContent = "Update Status";
            button.style.marginTop = "10px";

            const message = document.createElement("p");

            // update status when button is clicked
            button.addEventListener("click", async function() {

                button.disabled = true;
                message.textContent = "Saving...";

                try {

                    const response = await fetch(
                        "/api/consultations/" + consultation.id + "/status",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                status: statusSelect.value
                            })
                        }
                    );

                    const result = await response.json();

                    if (response.ok) {

                        status.textContent = "Status: " + result.status;
                        message.textContent = "Status saved successfully!";

                    } else {

                        message.textContent = result.error;
                    }

                } catch (error) {

                    message.textContent = "Could not update status.";

                }

                button.disabled = false;
            });

            // add everything to my consultation box
            box.appendChild(title);
            box.appendChild(concern);
            box.appendChild(treatment);
            box.appendChild(status);
            box.appendChild(statusSelect);
            box.appendChild(button);
            box.appendChild(message);

            list.appendChild(box);
        }

    } catch (error) {

        list.textContent = "Could not load consultations.";
    }
}

// show consultations when the dashboard opens
loadConsultations();
