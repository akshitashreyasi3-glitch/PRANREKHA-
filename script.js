/* =========================================================
   PRANREKHA: EVERY SIGNAL MATTERS
   Interactive astronaut health monitoring dashboard
   All sample records are illustrative, not real NASA telemetry.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "pranrekhaRecords";

    const sampleRecords = [
        {
            astronaut: "Commander Alex Morgan",
            mission: "PRANREKHA-01",
            day: 1,
            date: getDateOffset(2),
            phase: "Initial Adaptation",
            hr: 72,
            oxygen: 98,
            temp: 36.8,
            sys: 118,
            dia: 78,
            resp: 16,
            sleep: 7.5,
            sleepQuality: "Good",
            fatigue: "None reported",
            menstrual: "Not applicable",
            cycleNotes: "",
            notes: "Baseline health measurements."
        },
        {
            astronaut: "Commander Alex Morgan",
            mission: "PRANREKHA-01",
            day: 15,
            date: getDateOffset(1),
            phase: "Adaptation",
            hr: 74,
            oxygen: 98,
            temp: 36.7,
            sys: 116,
            dia: 77,
            resp: 17,
            sleep: 7,
            sleepQuality: "Good",
            fatigue: "Mild",
            menstrual: "Not applicable",
            cycleNotes: "",
            notes: "Routine monitoring."
        },
        {
            astronaut: "Commander Alex Morgan",
            mission: "PRANREKHA-01",
            day: 30,
            date: getDateOffset(0),
            phase: "Microgravity Exposure",
            hr: 76,
            oxygen: 97,
            temp: 36.8,
            sys: 115,
            dia: 76,
            resp: 17,
            sleep: 6.5,
            sleepQuality: "Fair",
            fatigue: "Moderate",
            menstrual: "Not applicable",
            cycleNotes: "",
            notes: "Illustrative mission monitoring entry."
        }
    ];

    let records = loadRecords();

    /* ---------------- DATE HELPERS ---------------- */

    function getDateOffset(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split("T")[0];
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getLatestRecords() {
        return [...records].sort((a, b) => {
            const dateDifference = new Date(a.date) - new Date(b.date);

            if (dateDifference !== 0) return dateDifference;

            return Number(a.day) - Number(b.day);
        });
    }

    /* ---------------- STORAGE ---------------- */

    function loadRecords() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn("Could not load saved records:", error);
        }

        return [...sampleRecords];
    }

    function saveRecords() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            console.error("Could not save records:", error);
            showMessage(
                "Your browser could not save this entry. Check available storage.",
                "error"
            );
        }
    }

    /* ---------------- PAGE NAVIGATION ---------------- */

    const pageTitles = {
        home: "MISSION CONTROL",
        dashboard: "HEALTH DASHBOARD",
        entry: "HEALTH DATA ENTRY",
        impact: "MICROGRAVITY IMPACT",
        timeline: "MISSION TIMELINE",
        reports: "HEALTH REPORTS"
    };

    window.showPage = function (pageId) {
        const selectedPage = document.getElementById(pageId);

        if (!selectedPage) return;

        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        selectedPage.classList.add("active");

        document.querySelectorAll(".nav-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );
        });

        const title = document.getElementById("pageTitle");

        if (title) {
            title.textContent = pageTitles[pageId] || "PRANREKHA";
        }

        if (pageId === "dashboard") renderDashboard();
        if (pageId === "timeline") renderTimeline();
        if (pageId === "reports") renderReports();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    document.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });

    /* ---------------- SAFE HTML ---------------- */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    /* ---------------- FORM MESSAGES ---------------- */

    function showMessage(message, type = "success") {
        const element = document.getElementById("formMessage");

        if (!element) return;

        element.textContent = message;
        element.className = `form-message ${type}`;
        element.style.display = "block";
    }

    /* ---------------- HEALTH DATA ENTRY ---------------- */

    const healthForm = document.getElementById("healthForm");

    if (healthForm) {
        const dateInput = document.getElementById("date");

        if (dateInput && !dateInput.value) {
            dateInput.value = getDateOffset(0);
        }

        healthForm.addEventListener("submit", event => {
            event.preventDefault();

            const getValue = id =>
                document.getElementById(id)?.value.trim() ?? "";

            const requiredFields = [
                "astronaut",
                "mission",
                "day",
                "date",
                "phase",
                "hr",
                "oxygen",
                "temp",
                "sys",
                "dia",
                "resp",
                "sleep"
            ];

            for (const field of requiredFields) {
                if (!getValue(field)) {
                    showMessage(
                        "Please complete all required fields.",
                        "error"
                    );
                    return;
                }
            }

            const numericFields = [
                "day",
                "hr",
                "oxygen",
                "temp",
                "sys",
                "dia",
                "resp",
                "sleep"
            ];

            const values = {};

            for (const field of numericFields) {
                values[field] = Number(getValue(field));

                if (!Number.isFinite(values[field])) {
                    showMessage(
                        "Please enter valid numerical measurements.",
                        "error"
                    );
                    return;
                }
            }

            const ranges = {
                day: [1, 10000],
                hr: [20, 250],
                oxygen: [50, 100],
                temp: [30, 45],
                sys: [50, 250],
                dia: [30, 150],
                resp: [5, 60],
                sleep: [0, 24]
            };

            for (const [field, range] of Object.entries(ranges)) {
                const [minimum, maximum] = range;

                if (
                    values[field] < minimum ||
                    values[field] > maximum
                ) {
                    showMessage(
                        `Please check the ${field} value. It is outside the accepted input range.`,
                        "error"
                    );
                    return;
                }
            }

            if (values.dia >= values.sys) {
                showMessage(
                    "Please check the blood pressure values.",
                    "error"
                );
                return;
            }

            const newRecord = {
                astronaut: getValue("astronaut"),
                mission: getValue("mission"),
                day: values.day,
                date: getValue("date"),
                phase: getValue("phase"),
                hr: values.hr,
                oxygen: values.oxygen,
                temp: values.temp,
                sys: values.sys,
                dia: values.dia,
                resp: values.resp,
                sleep: values.sleep,
                sleepQuality: getValue("sleepQuality"),
                fatigue: getValue("fatigue"),
                menstrual: getValue("menstrual"),
                cycleNotes: getValue("cycleNotes"),
                notes: getValue("notes")
            };

            records.push(newRecord);
            saveRecords();

            showMessage(
                "Health record successfully saved to PRANREKHA.",
                "success"
            );

            healthForm.reset();

            if (dateInput) {
                dateInput.value = getDateOffset(0);
            }

            renderDashboard();
            renderTimeline();
            renderReports();
        });
    }

    /* ---------------- SVG CHART GENERATOR ---------------- */

    function createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);

        if (!container) return;

        if (!data.length) {
            container.innerHTML =
                '<p class="empty-state">No health records available yet.</p>';
            return;
        }

        const width = 600;
        const height = 230;
        const padding = 42;

        const values = data.map(item => Number(item.value));

        const minimum = Math.min(...values);
        const maximum = Math.max(...values);

        const difference = maximum - minimum || 1;
        const chartMinimum = minimum - difference * 0.2;
        const chartMaximum = maximum + difference * 0.2;

        const xPosition = index => {
            if (data.length === 1) return width / 2;

            return padding +
                (index / (data.length - 1)) * (width - padding * 2);
        };

        const yPosition = value => {
            return height - padding -
                ((value - chartMinimum) /
                (chartMaximum - chartMinimum)) *
                (height - padding * 2);
        };

        const points = data.map((item, index) => ({
            x: xPosition(index),
            y: yPosition(Number(item.value)),
            value: Number(item.value),
            label: item.label
        }));

        const linePath = points.map((point, index) => {
            return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
        }).join(" ");

        const circles = points.map(point => `
            <circle
                cx="${point.x}"
                cy="${point.y}"
                r="5"
                fill="#46e6dc"
                stroke="#111831"
                stroke-width="2"
            >
                <title>${escapeHTML(point.label)}: ${point.value}</title>
            </circle>
        `).join("");

        const gridLines = [0, 1, 2, 3].map(index => {
            const y = padding +
                index * ((height - padding * 2) / 3);

            return `
                <line
                    x1="${padding}"
                    y1="${y}"
                    x2="${width - padding}"
                    y2="${y}"
                    stroke="rgba(255,255,255,0.10)"
                    stroke-dasharray="4 5"
                />
            `;
        }).join("");

        const areaPath = `
            ${linePath}
            L ${points[points.length - 1].x} ${height - padding}
            L ${points[0].x} ${height - padding}
            Z
        `;

        container.innerHTML = `
            <svg
                viewBox="0 0 ${width} ${height}"
                role="img"
                aria-label="${escapeHTML(options.title || "Health trend chart")}"
                class="health-chart"
            >
                ${gridLines}

                <path
                    d="${areaPath}"
                    fill="rgba(70,230,220,0.10)"
                />

                <path
                    d="${linePath}"
                    fill="none"
                    stroke="#46e6dc"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                ${circles}

                <text
                    x="${padding}"
                    y="20"
                    fill="#9ca8c8"
                    font-size="11"
                >${maximum.toFixed(1)}</text>

                <text
                    x="${padding}"
                    y="${height - 8}"
                    fill="#9ca8c8"
                    font-size="11"
                >${minimum.toFixed(1)}</text>
            </svg>
        `;
    }

    /* ---------------- DASHBOARD ---------------- */

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function renderDashboard() {
        const sorted = getLatestRecords();

        if (!sorted.length) return;

        const latest = sorted[sorted.length - 1];

        setText("dashboardCount", records.length);
        setText("dashHR", latest.hr + " bpm");
        setText("dashO2", latest.oxygen + "%");
        setText("dashTemp", latest.temp + " °C");
        setText("dashSys", `${latest.sys}/${latest.dia}`);
        setText("dashSleep", latest.sleep + " hrs");
        setText("dashResp", latest.resp + " /min");

        const heartRateData = sorted.map(record => ({
            value: record.hr,
            label: `Mission Day ${record.day}`
        }));

        const sleepData = sorted.map(record => ({
            value: record.sleep,
            label: `Mission Day ${record.day}`
        }));

        createLineChart("hrChart", heartRateData, {
            title: "Heart rate over mission days"
        });

        createLineChart("sleepChart", sleepData, {
            title: "Sleep duration over mission days"
        });
    }

    /* ---------------- MICROGRAVITY IMPACT EXPLORER ---------------- */

    const impacts = {
        cardio: {
            title: "Cardiovascular Health",
            subtitle: "The heart and circulatory system",
            description:
                "In microgravity, body fluids shift toward the upper body. Over time, the cardiovascular system adapts to the reduced gravitational demands. Astronauts may experience changes in blood volume, cardiovascular conditioning and their response to returning to gravity.",
            monitoring:
                "Heart rate, blood pressure, oxygen saturation and cardiovascular trends.",
            relevance:
                "PRANREKHA tracks cardiovascular measurements over mission days to help identify changes that may need further review."
        },

        sleep: {
            title: "Sleep & Circadian Rhythm",
            subtitle: "Rest, recovery and the body clock",
            description:
                "Astronauts in low Earth orbit can experience around 16 sunrises and sunsets every 24 hours. This unusual light-dark cycle, alongside mission schedules and operational demands, can affect sleep timing and quality.",
            monitoring:
                "Sleep duration, reported sleep quality and fatigue levels.",
            relevance:
                "PRANREKHA helps visualize sleep patterns and changes in reported fatigue throughout a mission."
        },

        bone: {
            title: "Bone & Muscle Health",
            subtitle: "The musculoskeletal system",
            description:
                "Without the usual weight-bearing demands of Earth, bones and muscles receive different mechanical loading. Prolonged exposure to microgravity can contribute to bone density loss and muscle deconditioning.",
            monitoring:
                "Exercise records, muscle performance assessments and bone-health measurements collected through appropriate mission protocols.",
            relevance:
                "PRANREKHA can organize related measurements and highlight changes across the mission timeline."
        },

        fluid: {
            title: "Body Fluid Distribution",
            subtitle: "Fluid shifts in microgravity",
            description:
                "Gravity normally pulls body fluids toward the lower body. In microgravity, fluids redistribute toward the head and upper body. Astronauts may notice facial puffiness and changes in fluid regulation.",
            monitoring:
                "Body measurements, fluid balance information and relevant cardiovascular observations.",
            relevance:
                "PRANREKHA connects body measurements with cardiovascular observations to provide a broader monitoring picture."
        },

        mental: {
            title: "Psychological Wellbeing",
            subtitle: "Cognitive and behavioural health",
            description:
                "Isolation, confinement, demanding schedules and separation from family can affect mood, concentration and wellbeing during long-duration missions. Individual experiences vary.",
            monitoring:
                "Self-reported mood, fatigue, sleep quality and optional wellbeing check-ins.",
            relevance:
                "PRANREKHA can help astronauts record subjective wellbeing indicators alongside physical health data."
        },

        reproductive: {
            title: "Menstrual & Reproductive Health",
            subtitle: "Inclusive astronaut health monitoring",
            description:
                "Menstrual health is an important part of comprehensive astronaut healthcare. Menstruation in space is possible, and menstrual management can be discussed with healthcare professionals before and during missions. Evidence about the effects of spaceflight on menstrual cycles remains limited.",
            monitoring:
                "Optional, private menstrual-cycle information and self-reported symptoms, when relevant and voluntarily provided.",
            relevance:
                "PRANREKHA includes optional menstrual-health fields so that relevant health information is not excluded from monitoring."
        }
    };

    window.impactInfo = function (key, selectedCard) {
        const impact = impacts[key];
        const detail = document.getElementById("impactDetail");

        if (!impact || !detail) return;

        document.querySelectorAll(".impact-card").forEach(card => {
            card.classList.remove("selected");
        });

        if (selectedCard) {
            selectedCard.classList.add("selected");
        }

        detail.innerHTML = `
            <div class="impact-detail-content">
                <p class="section-kicker">MICROGRAVITY RESEARCH</p>

                <h2>${escapeHTML(impact.title)}</h2>

                <h4>${escapeHTML(impact.subtitle)}</h4>

                <p>${escapeHTML(impact.description)}</p>

                <div class="impact-info-box">
                    <h3>WHAT CAN BE MONITORED?</h3>
                    <p>${escapeHTML(impact.monitoring)}</p>
                </div>

                <div class="impact-info-box">
                    <h3>HOW PRANREKHA HELPS</h3>
                    <p>${escapeHTML(impact.relevance)}</p>
                </div>
            </div>
        `;

        detail.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    };

    /* ---------------- TIMELINE ---------------- */

    window.renderTimelineChart = function () {
        const selector = document.getElementById("chartMetric");

        if (!selector) return;

        const metric = selector.value;

        const metricOptions = {
            hr: {
                field: "hr",
                label: "Heart Rate (bpm)"
            },
            oxygen: {
                field: "oxygen",
                label: "Oxygen Saturation (%)"
            },
            sleep: {
                field: "sleep",
                label: "Sleep Duration (hours)"
            },
            temp: {
                field: "temp",
                label: "Body Temperature (°C)"
            }
        };

        const selected = metricOptions[metric];

        if (!selected) return;

        const sorted = getLatestRecords();

        const data = sorted.map(record => ({
            value: Number(record[selected.field]),
            label: `Mission Day ${record.day}`
        }));

        createLineChart("timelineChart", data, {
            title: selected.label
        });
    };

    function renderTimelineTable() {
        const tableBody = document.getElementById("timelineRecords");

        if (!tableBody) return;

        const sorted = [...getLatestRecords()].reverse();

        if (!sorted.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No records available.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = sorted.map(record => `
            <tr>
                <td>${escapeHTML(formatDate(record.date))}</td>
                <td>${escapeHTML(record.day)}</td>
                <td>${escapeHTML(record.hr)} bpm</td>
                <td>${escapeHTML(record.oxygen)}%</td>
                <td>${escapeHTML(record.sleep)} hrs</td>
                <td>${escapeHTML(record.phase)}</td>
                <td>${escapeHTML(record.fatigue || "—")}</td>
            </tr>
        `).join("");
    }

    function renderTimeline() {
        renderTimelineChart();
        renderTimelineTable();
    }

    /* ---------------- REPORTS ---------------- */

    function average(field) {
        if (!records.length) return 0;

        const total = records.reduce((sum, record) => {
            return sum + Number(record[field] || 0);
        }, 0);

        return total / records.length;
    }

    function renderReports() {
        setText("totalRecords", records.length);

        if (!records.length) {
            setText("avgHR", "—");
            setText("avgO2", "—");
            setText("avgSleep", "—");
            setText("avgTemp", "—");
            return;
        }

        setText("avgHR", average("hr").toFixed(1) + " bpm");
        setText("avgO2", average("oxygen").toFixed(1) + "%");
        setText("avgSleep", average("sleep").toFixed(1) + " hrs");
        setText("avgTemp", average("temp").toFixed(1) + " °C");
    }

    /* ---------------- CSV EXPORT ---------------- */

    function csvEscape(value) {
        const textValue = String(value ?? "");

        return `"${textValue.replace(/"/g, '""')}"`;
    }

    window.downloadCSV = function () {
        if (!records.length) {
            alert("There are no records to export yet.");
            return;
        }

        const fields = [
            "astronaut",
            "mission",
            "day",
            "date",
            "phase",
            "hr",
            "oxygen",
            "temp",
            "sys",
            "dia",
            "resp",
            "sleep",
            "sleepQuality",
            "fatigue",
            "menstrual",
            "cycleNotes",
            "notes"
        ];

        const rows = [
            fields.map(csvEscape).join(","),
            ...records.map(record =>
                fields.map(field => csvEscape(record[field])).join(",")
            )
        ];

        const csvContent = "\uFEFF" + rows.join("\n");

        downloadBlob(
            csvContent,
            "pranrekha_health_records.csv",
            "text/csv;charset=utf-8;"
        );
    };

    /* ---------------- REPORT DOWNLOAD ---------------- */

    window.downloadReport = function () {
        if (!records.length) {
            alert("There are no records to include in the report.");
            return;
        }

        const report = [
            "PRANREKHA: EVERY SIGNAL MATTERS",
            "ASTRONAUT HEALTH MONITORING REPORT",
            "====================================",
            "",
            "IMPORTANT: This report contains user-entered data and illustrative sample data.",
            "It is not a medical diagnosis or a substitute for professional assessment.",
            "",
            `Total records: ${records.length}`,
            `Average heart rate: ${average("hr").toFixed(1)} bpm`,
            `Average oxygen saturation: ${average("oxygen").toFixed(1)}%`,
            `Average sleep duration: ${average("sleep").toFixed(1)} hours`,
            `Average body temperature: ${average("temp").toFixed(1)} °C`,
            "",
            "MISSION RECORDS",
            "====================================",
            ""
        ];

        getLatestRecords().forEach(record => {
            report.push(
                `Astronaut: ${record.astronaut}`,
                `Mission: ${record.mission}`,
                `Mission Day: ${record.day}`,
                `Date: ${formatDate(record.date)}`,
                `Mission Phase: ${record.phase}`,
                `Heart Rate: ${record.hr} bpm`,
                `Oxygen Saturation: ${record.oxygen}%`,
                `Temperature: ${record.temp} °C`,
                `Blood Pressure: ${record.sys}/${record.dia}`,
                `Respiratory Rate: ${record.resp} /min`,
                `Sleep: ${record.sleep} hours`,
                `Sleep Quality: ${record.sleepQuality}`,
                `Fatigue: ${record.fatigue}`,
                `Menstrual Health: ${record.menstrual}`,
                `Cycle Notes: ${record.cycleNotes}`,
                `Additional Notes: ${record.notes}`,
                "------------------------------------",
                ""
            );
        });

        downloadBlob(
            report.join("\n"),
            "pranrekha_health_report.txt",
            "text/plain;charset=utf-8;"
        );
    };

    /* ---------------- DOWNLOAD HELPER ---------------- */

    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }


/* ---------------- INITIALIZATION ---------------- */

saveRecords();

showPage("home");

renderDashboard();
renderTimeline();
renderReports();

});