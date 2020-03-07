# Timbus

Timbus is an extensible assignment submission server built on top of Node.js and Express. It is a simple implementation of a cloud-based storage system.

## Data

There are four types of data that need to be persisted by Timbus. Timbus takes care of some of this data itself inside of a `data/` directory, but ultimately uses **plugins** to implement how this data will be managed.

### Users

Information about which people are allowed to use the system. A single user entry contains the following properties:

- `uid`: A unique identifier for the user
- `name`: The name of the user
- `role`: The role of the user (`admin` or `user`)

User information is stored inside of of the `data/users.json` file. You can edit this file to control which users have access to Timbus.

### Assignments

A list of the assignments that users can submit files for. A single assignment description entry contains the following properties:

- `aid`: The unique identifier for the assignment
- `name`: The name of the assignment

### File Metadata

Information that describes a file that has been uploaded. A single file metadata entry has the following properties:

- `mid`: The unique identifier of the metadata object. Created by the storage plugin.
- `uid`: The ID of the user the submission belongs to
- `aid`: The assignment id
- `fileName`: The name to use when the user downloads the file submission
- `submissionDate`: The date the assignment was submitted
- `isVerified`: Whether or not the submission has been verified

### Files

The actual uploaded file itself. File uploading and downloading is managed entirely by Timbus.

## Plugins

Plugins allow you to control certain aspects of Timbus.

### Storage Plugins

You are required to supply a storage plugin to handle the management of this data. The storage plugin is a function that follows this template:

```js
/**
 * Creates the plugin object that will expose the required functions to Timbus.
 *
 * @param {object} logger  The logger used by Timbus.
 * @param {string} dataDir The location of the `data/` directory used by
 *                         Timbus.
 *
 * @returns {object} See documentation below for the structure of this object.
 */
function storagePlugin(logger, dataDir) {
  return {
    /**
     * Provides a list of all the available assignments users can submit.
     *
     * @returns {Promise<object[], Error>} A promise that resolves to an
     *                                     array of objects describing the
     *                                     assignments.
     */
    assignments: function() {},

    /**
     * Stores a file metadata object.
     *
     * @param {object} data The file metadata object to store
     *
     * @returns {Promise<undefined, Error>} A promise that resolves when
     *                                      the data has been stored.
     */
    put: function(data) {},

    /**
     * Retrieves file metadata from storage using the provided query.
     *
     * The query object can have the following properties:
     *
     * - `uid`: The unique identifier of the user who's submission data
     *   to fetch.
     * - `aid`: The unique identifier of the assignment to fetch.
     *
     * @param {object} [query] An optional query object that helps filter
     *                         the results.
     *
     * @returns {Promise<object[], Error>} A promise that resolves to an
     *                                     array of objects describing the
     *                                     file metadata.
     */
    get: function(query) {}
  };
}

module.exports = plugin;
```

## Authentication

You can optionally provide an authentication plugin for Timbus to use to restrict access to the submission server. This function follows this template:

```js
/**
 * Creates the plugin object used to authenticate requests from the client.
 *
 * @param {object} logger         The logger used by Timbus.
 * @param {object} [pluginConfig] Configuration used by the plugin. You can
 *                                supply configuration through an optional
 *                                configuration file when starting Timbus.
 *
 * @returns {object} See the documentation below for the object structure.
 */

function authPlugin(logger, pluginConfig) {
  return {
    /**
     * Contains the logic used for authenticating a request receied by Timbus.
     *
     * @param {Request}  req The Express.js request object
     * @param {Response} res The express.js response object
     *
     * @returns {Promise<object, Error>} A promise that will resolve with the
     *                                   user data object upon successful
     *                                   authentication.
     */
    authenticate: function(req, res) {}
  };
}
```
