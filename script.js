// ===============================
// Redirect to Survey Page
// ===============================
function goToSurvey() {
    window.location.href = "survey.html";
}


// ===============================
// Submit Survey (SAFE VERSION)
// ===============================
async function submitSurvey() {

    const messageBox = document.getElementById("message");

    if (!messageBox) {
        console.error("Message element not found.");
        return;
    }

    const techLevel = document.getElementById("tech_level");
    const projectExperience = document.getElementById("project_experience");
    const confidenceLevel = document.getElementById("confidence_level_input");
    const biggestBlock = document.getElementById("biggest_block");
    const domainInterest = document.getElementById("domain_interest");
    const motivationType = document.getElementById("motivation_type");
    const primaryGoal = document.getElementById("primary_goal");
    const weeklyCommitment = document.getElementById("weekly_commitment");

    if (!techLevel || !projectExperience || !confidenceLevel ||
        !biggestBlock || !domainInterest || !motivationType ||
        !primaryGoal || !weeklyCommitment) {

        messageBox.innerText = "Form loading error. Please refresh the page.";
        console.error("One or more form elements not found.");
        return;
    }

    const answers = {
        tech_level: techLevel.value,
        project_experience: projectExperience.value,
        confidence_level_input: confidenceLevel.value,
        biggest_block: biggestBlock.value,
        domain_interest: domainInterest.value,
        motivation_type: motivationType.value,
        primary_goal: primaryGoal.value,
        weekly_commitment: weeklyCommitment.value
    };

    messageBox.innerText = "Analyzing your confidence... Please wait.";

    try {
        const response = await fetch("http://127.0.0.1:5000/analyze-confidence", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(answers)
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        // Save analysis result
        localStorage.setItem("confidenceAnalysis", JSON.stringify(data));

        // Reset XP when new survey is submitted
        localStorage.setItem("userXP", "0");
        localStorage.setItem("completedTasks", JSON.stringify([]));

        window.location.href = "analysis.html";

    } catch (error) {
        console.error("Submission error:", error);
        messageBox.innerText = "Could not connect to server. Make sure backend is running.";
    }
}


// ===============================
// Load Analysis Page
// ===============================
function loadAnalysis() {

    const result = JSON.parse(localStorage.getItem("confidenceAnalysis"));

    if (!result) {
        const text = document.getElementById("confidenceText");
        if (text) {
            text.innerText = "No analysis found. Please complete the survey first.";
        }
        return;
    }

    // -----------------------
    // Confidence Level
    // -----------------------
    const confidenceText = document.getElementById("confidenceText");
    const confidenceFill = document.getElementById("confidenceFill");

    if (confidenceText) {
        confidenceText.innerText = "Confidence Level: " + result.confidence_level;
    }

    let percentage = 30;

    if (result.confidence_level === "Low") percentage = 30;
    else if (result.confidence_level === "Medium") percentage = 60;
    else if (result.confidence_level === "High") percentage = 90;

    if (confidenceFill) {
        setTimeout(() => {
            confidenceFill.style.width = percentage + "%";
        }, 200);
    }

    // -----------------------
    // XP SYSTEM + Recommended Tasks
    // -----------------------
    const taskList = document.getElementById("tasks");
    const xpDisplay = document.getElementById("xpPoints");

    let xp = parseInt(localStorage.getItem("userXP")) || 0;
    let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];

    if (xpDisplay) {
        xpDisplay.innerText = xp;
    }

    if (taskList && result.recommended_tasks) {

        taskList.innerHTML = "";

        result.recommended_tasks.forEach((task, index) => {

            const taskId = "task_" + index;

            const li = document.createElement("li");

            li.innerHTML = `
                <label>
                    <input type="checkbox" id="${taskId}">
                    ${task.replace(/_/g, " ")}
                </label>
            `;

            taskList.appendChild(li);

            const checkbox = document.getElementById(taskId);

            // Restore checked state
            if (completedTasks.includes(taskId)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener("change", function () {

                if (this.checked) {
                    xp += 10;
                    completedTasks.push(taskId);
                } else {
                    xp -= 10;
                    completedTasks = completedTasks.filter(id => id !== taskId);
                }

                localStorage.setItem("userXP", xp);
                localStorage.setItem("completedTasks", JSON.stringify(completedTasks));

                xpDisplay.innerText = xp;
            });
        });
    }

    // -----------------------
    // Improvement Suggestions
    // -----------------------
    const improveList = document.getElementById("improveList");

    if (improveList && result.improvement_suggestions) {
        improveList.innerHTML = "";

        result.improvement_suggestions.forEach(item => {
            improveList.innerHTML += `<li>${item}</li>`;
        });
    }

    // -----------------------
    // Selected Answers
    // -----------------------
    const answersDiv = document.getElementById("answers");

    if (answersDiv && result.selected_answers) {
        answersDiv.innerHTML = "";

        Object.entries(result.selected_answers).forEach(([key, value]) => {
            answersDiv.innerHTML += `
                <p><strong>${key.replace(/_/g, " ")}:</strong> ${value}</p>
            `;
        });
    }
}


// ===============================
// Start Journey Button
// ===============================
function startJourney() {
    alert("Your personalized growth journey begins now 🚀");
}