/*
 * Tinhico — config.js
 * Temporary/provisional values. Confirm with Tinhico before production.
 */

window.TinhicoConfig = {
    credit: {
        rate: 0.30,
        defaultTermDays: 30,
        frequencies: {
            daily: { label: "Diário", periods: 30, outputLabel: "por dia" },
            weekly: { label: "Semanal", periods: 4, outputLabel: "por semana" },
            monthly: { label: "Mensal", periods: 1, outputLabel: "por mês" }
        }
    },

    hero: {
        autoplay: true,
        interval: 6000
    }
};
