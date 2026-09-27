/*
 * TINHICO — CREDIT SIMULATOR
 *
 * IMPORTANT:
 * The 30% rate and 30-day term are provisional values observed
 * in the current system. They must be validated by Tinhico before
 * production.
 */

(() => {
    "use strict";

    const form = document.querySelector("#credit-simulator");
    if (!form) return;

    const amountInput = form.querySelector("#credit-amount");
    const frequencyInputs = Array.from(
        form.querySelectorAll('input[name="frequency"]')
    );
    const termInput = form.querySelector("#credit-term");

    const totalOutput = document.querySelector("[data-sim-total]");
    const totalSecondaryOutput = document.querySelector(
        "[data-sim-total-secondary]"
    );
    const requestedOutput = document.querySelector("[data-sim-requested]");
    const rateOutput = document.querySelector("[data-sim-rate]");
    const installmentsOutput = document.querySelector("[data-sim-installments]");
    const periodOutput = document.querySelector("[data-sim-period]");

    const config = window.TinhicoConfig?.credit ?? {};
    const rate = Number(config.rate) || 0.30;

    const frequencies = {
        daily: {
            periods: 30,
            label: "por dia"
        },
        weekly: {
            periods: 4,
            label: "por semana"
        },
        monthly: {
            periods: 1,
            label: "por mês"
        }
    };

    function getFrequency() {
        const selected = frequencyInputs.find((input) => input.checked);
        return selected?.value || "monthly";
    }

    function formatMoney(value) {
        if (!Number.isFinite(value)) return "—";

        return new Intl.NumberFormat("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value) + " MT";
    }

    function getSimulation() {
        const amount = Number(amountInput.value);
        const termDays = Number(termInput.value) || 30;
        const frequency = getFrequency();

        if (!Number.isFinite(amount) || amount <= 0) {
            return null;
        }

        /*
         * Provisional model:
         * total = requested amount + 30% fee
         *
         * The current business rule may change after Tinhico validates
         * the official credit products.
         */
        const total = amount * (1 + rate);

        let periods = frequencies[frequency]?.periods || 1;

        /*
         * If a term other than 30 days is selected, scale the number
         * of payment periods proportionally for this prototype.
         */
        if (frequency === "daily") {
            periods = termDays;
        } else if (frequency === "weekly") {
            periods = Math.max(1, Math.ceil(termDays / 7));
        } else {
            periods = Math.max(1, Math.ceil(termDays / 30));
        }

        const installment = total / periods;

        return {
            amount,
            total,
            rate,
            termDays,
            frequency,
            periods,
            installment,
            label: frequencies[frequency]?.label || "por mês"
        };
    }

    function renderSimulation() {
        const simulation = getSimulation();

        if (!simulation) {
            totalOutput.textContent = "—";
            totalSecondaryOutput.textContent = "—";
            requestedOutput.textContent = "—";
            installmentsOutput.textContent = "—";
            periodOutput.textContent = "por mês";
            return;
        }

        totalOutput.textContent = formatMoney(simulation.installment);
        totalSecondaryOutput.textContent = formatMoney(simulation.total);
        requestedOutput.textContent = formatMoney(simulation.amount);
        rateOutput.textContent = `${Math.round(simulation.rate * 100)}%`;
        installmentsOutput.textContent = String(simulation.periods);
        periodOutput.textContent = simulation.label;
    }

    amountInput.addEventListener("input", renderSimulation);
    termInput.addEventListener("change", renderSimulation);

    frequencyInputs.forEach((input) => {
        input.addEventListener("change", () => {
            frequencyInputs.forEach((item) => {
                item.closest(".payment-option")?.classList.toggle(
                    "payment-option--active",
                    item.checked
                );
            });

            renderSimulation();
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        renderSimulation();
    });

    renderSimulation();
})();
