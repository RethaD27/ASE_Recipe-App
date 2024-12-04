const Ajv = require("ajv"); // Import Ajv, a library for JSON schema validation.
const fs = require("fs"); // Import the file system module to read the manifest file.

/**
 * JSON schema definition for validating a web app manifest file.
 * This schema ensures that the manifest meets the required structure and properties.
 */
const manifestSchema = {
  type: "object",
  required: ["name", "short_name", "start_url", "display", "icons"],
  properties: {
    /**
     * @property {string} name - The full name of the web application.
     */
    name: { type: "string" },

    /**
     * @property {string} short_name - The short name of the web application, typically used when space is limited.
     */
    short_name: { type: "string" },

    /**
     * @property {string} start_url - The URL that loads when the application is launched.
     */
    start_url: { type: "string" },

    /**
     * @property {string} display - The display mode for the application. Must be one of the specified options.
     */
    display: {
      type: "string",
      enum: ["fullscreen", "standalone", "minimal-ui", "browser"]
    },

    /**
     * @property {Array} icons - An array of icon objects specifying the app's icons.
     */
    icons: {
      type: "array",
      items: {
        type: "object",
        required: ["src", "sizes", "type"],
        properties: {
          /**
           * @property {string} src - Path to the icon file.
           */
          src: { type: "string" },

          /**
           * @property {string} sizes - Icon dimensions in the format "widthxheight" (e.g., "192x192").
           */
          sizes: { type: "string", pattern: "^[0-9]+x[0-9]+$" },

          /**
           * @property {string} type - MIME type of the icon file (e.g., "image/png").
           */
          type: { type: "string" }
        }
      }
    },

    /**
     * @property {string} background_color - The background color of the splash screen. Must be a valid hex code.
     */
    background_color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },

    /**
     * @property {string} theme_color - The theme color of the application. Must be a valid hex code.
     */
    theme_color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },

    /**
     * @property {string} orientation - The default orientation of the application.
     */
    orientation: { type: "string", enum: ["portrait", "landscape"] },

    /**
     * @property {string} description - A description of the application.
     */
    description: { type: "string" },

    /**
     * @property {Array} shortcuts - Optional array of shortcuts for quick actions.
     */
    shortcuts: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "short_name", "description", "url"],
        properties: {
          name: { type: "string" },
          short_name: { type: "string" },
          description: { type: "string" },
          url: { type: "string" },
          icons: {
            type: "array",
            items: {
              type: "object",
              required: ["src", "sizes"],
              properties: {
                src: { type: "string" },
                sizes: { type: "string", pattern: "^[0-9]+x[0-9]+$" }
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Validates a manifest file against the defined JSON schema.
 * @function validateManifest
 * @param {string} filePath - The file path of the manifest file to validate.
 */
const validateManifest = (filePath) => {
  const ajv = new Ajv(); // Create an Ajv instance for schema validation.
  const validate = ajv.compile(manifestSchema); // Compile the manifest schema.

  try {
    // Read and parse the manifest file.
    const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Validate the manifest against the schema.
    const valid = validate(manifest);
    if (valid) {
      console.log("Manifest is valid!");
    } else {
      console.error("Manifest validation failed:", validate.errors);
    }
  } catch (error) {
    console.error(`Error reading or parsing the manifest file: ${error.message}`);
  }
};

// Retrieve the manifest file path from command-line arguments or use a default.
const filePath = process.argv[2] || "./manifest.json";

// Run the validation function on the specified file.
validateManifest(filePath);
