const obsidian = require('obsidian');

class HTMLRenderer extends obsidian.Plugin {
    onload() {
        this.registerMarkdownPostProcessor(async (element, context) => {
            // Look for HTML file embeds in the format ![[my_html.html]]
            const embeds = element.querySelectorAll('span.internal-embed');

            for (let embed of embeds) {
                const src = embed.innerText.trim();
                if (src.endsWith('.html')) {
                    try {
                        const htmlContent = await this.loadHTMLContent(src);
                        const iframe = this.createIframe(htmlContent);
                        embed.replaceWith(iframe);
                    } catch (error) {
                        console.error(`Error loading HTML content from ${src}:`, error);
                        this.displayError(embed, `Failed to load HTML content: ${src}`);
                    }
                }
            }
        });
    }

    async loadHTMLContent(filePath) {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof obsidian.TFile) {
            return await this.app.vault.read(file);
        } else {
            throw new Error(`File not found: ${filePath}`);
        }
    }

    createIframe(htmlContent) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = '0';
        iframe.srcdoc = htmlContent;
        return iframe;
    }

    displayError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = message;
        element.replaceWith(errorDiv);
    }
}

module.exports = HTMLRenderer;
