// src/stores/authorsStore.ts
import { defineStore } from 'pinia'
import verovio from 'verovio';

export const useVerovioStore = defineStore('verovio', {
    state: () => {
        return {
            tk: <any>null,
        }
    },
    actions: {
        /**
        * Initializes the Verovio toolkit if not already initialized.
        * Returns a Promise that resolves when `tk` is initialized.
        */
        async ensureTkInitialized() {
            if (!this.tk) {
                await verovio.module.onRuntimeInitialized;
                this.tk = new verovio.toolkit();
            }
        }
    },
})
