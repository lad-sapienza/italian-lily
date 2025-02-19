# s:CMS

A static site Content Management System developend and maintained by LAD: Laboratorio di Archeologia Digitale alla Sapienza 

s:CMS is an easy, open source and ready-to-use content management system for [generating static sites](https://www.cloudflare.com/en-gb/learning/performance/static-site-generator/) based on [Gatsby.js](https://www.gatsbyjs.com/). It also implements data-oriented components for easily **connecting**, **displaying** and **analysing** research data stored in databases, in flat files or remotely, in an easy, informative and efficient way: maps, searchable tables, and soon to come charts. 

Our aim is to enable researchers to publish online rich data portals, by pulling the information from a wide range of sources, be them flat static files, remotely accessible services, or online databases. We try to build components — resuing as much as possible well known open source projects — to make the integration seemless and to offer a simplified workflow to securely publish contents.

Static sites are fast, secure, durable: no databases to manage, no code that gets outdated, no performace issues. Once you have build and deployed your site, you are sure it will never stop working.

### What can I do with s:CMS?
You can setup in few minutes a fully working and secure website containing static pages, with text and images describing your project and also rich data pulled in real time from remote databases and or self-hosted as static files, with which you can build maps, and fully searcheable tables. You are fully enabled to customise the layout and look&feel of your site to perfectly fit your needs.

Think of s:CMS as the *public, fully-customiseable front-end of your research database*


## Table of contents

1. [Environment setup](#environment-setup)
1. [Installing s:CMS](#installing-scms)
1. [Edit site's metadata](#edit-sites-metadata)
1. [Connecting to a default Directus instance](#connecting-to-a-default-directus-instance)
1. [Customise site's layout and look & feel](#customise-sites-layout-and-look--feel)
1. [Adding content](#adding-content)
1. [Deploy your site for free on Github Pages](#deploy-your-site-for-free-on-github-pages)
1. [Update the site to the latest version](#update-the-site-to-the-latest-version)
1. [API](#api)
   1. [Access data from components](#access-data-from-components)
   1. [MapLeaflet](#mapleaflet)
   1. [MapContainer](#mapcontainer)
   1. [LayersControl](#layerscontrol)
   1. [Vectorlayer](#vectorlayer)
   1. [Rasterlayer and DefaultBaseLayers](#rasterlayer-and-defaultbaselayers)
   1. [Dtable](#dtable)
   1. [Columns](#columns)
   1. [Query Tool](#query-tool)
   1. [Search](#search)
   1. [View Record](#view-record)
1. [Built with s:CMS](#build-with-sCMS)


## Environment setup
To use s:CMS, you need to have a working environment. s:CMS is basically a Gatsby starter ([more about starters](https://www.gatsbyjs.com/docs/how-to/local-development/starters/)), completed with custom components that are already ready to use. 
[Gatsby.js](https://www.gatsbyjs.com/) is a static site generator that allows you to create static websites by using React and GraphQL. It is a great tool for creating websites that are fast, secure, and durable. It is also a great tool for creating websites that are easy to maintain. It runs on [Node.js](https://nodejs.org/), a free, open-source, cross-platform JavaScript runtime environment that lets developers create servers, web apps, command line tools and scripts and [React](https://react.dev/), a library for web and native user interfaces developed by Meta.

You need to install [Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) ans the [Gatsby CLI](https://www.gatsbyjs.com/docs/reference/gatsby-cli) (command line interface) to be anbe to install and customise s:CMS.


## Installing sCMS

Open a terminal or command prompt window and type (or copy/paste)

```bash
npx gatsby new {my-new-site} https://github.com/lad-sapienza/sCMS
```

Make sure to replace `{my-new-site}` in the command above with the name of your own project. The gatsby CLI will create e new folder, named {my-new-site} and will download into it the s:CMS starter.

After, change the working directory to get inside your project:

```bash
cd {my-new-site}
```

and finally install all the dependencies by running:

```bash
npm install
```

**Please note**: `npm i` is a shorthand for `npm install` so you can use it instead of typing the full command.

The installing of the dependencies might require up to few minutes, depending on your connection. When it finishes, run:

```bash
npm start
```

to start the development server. The site will be available at the the default URL [http://localhost:8000](http://localhost:8000). To stop the server type `CTRL + C`.

Open the `{my-new-site}` folder with your favorite code editor and start editing the code tu customise the site. Your edits will be previewed in real time at [http://localhost:8000](http://localhost:8000).

## Edit site's metadata
The principal metadata of the site can be changed by editing `gatsby-config.js` file located in the root of your installation. Lines 15-21 are the ones that define the metadata of the site and look by defauld as follows:

```js
...
pathPrefix: process.env.NODE_ENV === "production" ? "/sCMS/" : "/",
siteMetadata: {
    title: `s:CMS`,
    description: `S:CMS | Static site Content Managemt System is developend and maintained by LAD: Laboratorio di Archeologia Digitale alla Sapienza`,
    author: `Julian Bogdani <julian.bogdani@uniroma1.it>`,
    siteUrl: `https://github.com/lad-sapienza/sCSM#readme`,
  },
...
```

Feel free to change
- `title`: the default title attribute of the site
- `description`: the default descriprion attribute of the site
- `author`: the default author attribute of the site
- `siteUrl`: The URL where the site is available

If is also important to change at line 15: `pathPrefix` to match the relative URL where the site will be published.

This is a very impornt passage, since its misconfiguration might determine wrong paths for internal links.

> Edits of the `gatsby-config.js` file will require the restart of the developing server to get updated. Get back to the terminal window, stop the running server by typig `CTRL + C` and start it again by entering `npm start`.

## Connecting to a default Directus instance

s:CMS is designed to work seemlessly with [Directius.io](https://directus.io/), a composable data platform purpose-built for democratizing the world's data.

To access the data stored in a Directus instance you need typically a Directus endpoint, i.e. the URL where Directus is running and an [authentication token](https://docs.directus.io/reference/authentication.html).

Create a file in the root of your project named `.env.development` and add two lines with the following content:

```env
GATSBY_DIRECTUS_ENDPOINT={url-of-your-directus-instance}
GATSBY_DIRECTUS_TOKEN={directus-token}
```

and replace `{url-of-your-directus-instance}` and `directus-token` with the URL of your Directus instance and the token of your instance.

Save and close the file and re-start the development server by typing `CTRL + C` and then `npm start` in the terminal.

## Customise site's layout and look & feel

sCMS comes with a default template and a set of example pages. By design, we are not aiming at developing templates: layout and graphics are entirely on your own. Nevertheless sCMS is delivered with a set of tools — such as [React Bootstrap](https://react-bootstrap.github.io/) — that make it easy to write your own templates or customise the default one.

The files responsible for layouting are collected in the `src/usr/layout/` directory.
You can customise the header, the footer, the general layout and stying by editing:
- `header.js`: the component used to display the header
- `footer.js`: the component used to display the footer
- `layout.js`: the scaffold component of the layout. You ba create highly customised layouts **without** the need to edit the main layout.js file.
- `layout.scss`: the [SASS](https://sass-lang.com/documentation/syntax/) file containing the styling.

> **Please note** that you should not edit `layout.css`, `layout.css.map` since this files are being created and updated by the system each time that layout.scss is being updated.

Other assets, such as static image files can be added in the `src/usr/images/` folder or in the `static/` folder. Add to `src/usr/images/` files to be used with the [Gatsby Image Plugin](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) and similar. Images ad other files saved in the `static/` folder will be copied as they (and without any transformation) are in the publically available version of the site.


## Adding content

s:CMS also provide tools for easily build and personalize the pages of your website. Being based on Gatsby, every such page works with the [MDX Markdown extension](https://www.gatsbyjs.com/docs/glossary/mdx/). 

Each MD or MDX file saved in `src/usr/contents/` folder will be automatically processed to become a publically available page of the site.


### 1. Front Matter

Firstly, it is important that you can configure every page's visualization using metadata that are disposed by default:

| Field | Required | Example | Description |
|---|---|---|---|
| `title` | Yes | `Welcome to or new and shiny s:CMS based web site`  | Define the name shown for the page and on the navbar                        |
| `date` | no | 2024-04-10 | Define the date of creation/last update of the page |
| `slug` | yes | `welcome` | Define the personalized ending of the URL address specific to the page.  |
| `menu_position`   | No | 0 | Define the internal indexing of the page used for the correct ordering in the navbar. |

### 2. Static page

As the most basic unit of your website, you can add one or more static pages integrating text, links, and images. The MDX structure permits you to easily use Markdown and HTML syntax, and also allows you to integrate static query components to further personalize your page.

### 3. Pages with dynamic content:

s:CMS provides you a full arrangement of features for building pages integrating static content (text, images, links) with dynamic data (accessed by an Ajax call) taken from a relational database. The system is optimized for online databases managed by Directus, but local access can also be used.

#### 3.1. Maps

s:CMS gives you the chance to build a web-GIS map composed by the juxtaposition of Raster and Vector layers. Various tools are provided for helping customize both the graphical rendering of the wrapper and the visualization of the content.

For the RASTER bases, a simplified access to the most common providers of satellite imagery and digital maps is provided by default, with the possibility to extend the selection to custom maps. Tools are also provided for full customization of vector layers, from data filtering to icon customization. For more complex projects, a layer selector is provided to allow users a cleaner data visualization.

#### 3.2. Table

You can also add a table to organically show your data in an intuitive format! The table component provides options for a front-end general filter. With various graphical configuration options, the presentation of data can be customized to fit the specific needs of the project. Additionally, you can choose which fields to display and customize how they are presented, adding external and/or internal links or preview images that mirror outside sources.

(Learn how: [Dtable](#dtable))

#### 3.3. Search page

Enhance the navigation of your data by adding a query page. This easily customizable tool supports various query logics and result presentations, allowing you to select which fields are searchable and how the results are displayed. You can also include links to external resources, internal pages, or even previews of content.

(Learn how: [Search](#search))

#### 3.4. Record page

A page that displays an item's details in a simple list format and can be customized to fit your needs. The record page can be accessed only through direct links from other pages on the site, providing a comprehensive view of complex information and allowing for detailed exploration that may not be fully covered in summary pages.

(Learn how: [View Record](#view-record))

## Deploy your site for free on Github Pages

`Documentation to be completed`

## Update the site to the latest version

S:CMS comes with two commands to update the site to the latest version:

```bash
npm run upgrage-main
```

will updated the site using the [`main` branch](https://github.com/lad-sapienza/sCMS/) as the suource for the files, and 

```bash
npm run upgrage-dev
```

will use the [`dev` branch](https://github.com/lad-sapienza/sCMS/tree/dev).

> Please note that the upgrade command requires `rsync` to run. [rsync](https://en.wikipedia.org/wiki/Rsync) is a utility for transferring and synchronizing files between a computer and a storage drive and across networked computers by comparing the modification times and sizes of files. It is commonly found on Unix-like operating systems and is under the GPL-3.0-or-later license.  
> Run `which rsync` in your terminal to check if `rsync` is available.

---

## API

### Access data from components

Most of the S:CMS componens have a unified interface to access data stored in local/remote files or on a Directus instance. Thi interface also implements some default basic data transformation services. These parameters are collected in a literal object names `source` that can be provided to the single components.

The `source` object must follow the following shape:

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `path2data` | string | no (required if `dEndPoint` or `dTable` are not set) | _null_ | Path to static file of structured data (JSON, GeoJSON, CSV, etc.): might be a local, relative path or an URL. |
| `dEndPoint` | string | no (required if either `path2data` nor environmental variable `GATSBY_DIRECTUS_ENDPOINT` or are not set) | _null_ | Full URL of the API endpoint of a Directus running instance. |
| `dTable` | string | no (required if `dEndPoit` or `GATSBY_DIRECTUS_ENDPOINT` are set). | _null_ | The table name of a running Directus instance. |
| `dToken` | string | no (required if environmentantal variable `GATSBY_DIRECTUS_TOKEN` is not set and the Directus API requires authentication) | _null_ | Access token to accedd the Directus API, if needed. |
| `dQueryString` | string | no | _null_ | A query-string formatted filter that will be appended to the endpoint to form an API filter for the data. |
| `id` | integer | no (required if retrieving a record) | _null_ | Id of a specific record to retrieve. |
| `transType` | string | no | "geojson" | Tranformation to apply to data retrieved from the api of from the file system. One of the following values can be used: "text", "csv2json", "json", "geojson". |

s:CMS provides a way to define a default Directus API data source as [environment variables](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/). In development, Gatsby will load environment variables from a file named `.env.development`. For builds, it will load from `.env.production`. If you are using GitHub Pages as a deployment platform, you can use [secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions). s:CMS handles automatically the following environmental variables:

- `GATSBY_DIRECTUS_ENDPOINT`: a replacement of the parameter `source.dEndPoint`
- `GATSBY_DIRECTUS_TOKEN`: a replacements of the paramater `source.dToken`

### MapLeaflet

The `MapLeaflet` component is used to create maps using Leaflet.js and it is a wrapper around [`MapContainer`](https://react-leaflet.js.org/docs/api-map/) module.

**Props**

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `height` | string | no | "800px" | Height (with unit) of the map element. |
| `center` | string | no | "0,0,2" | Center of the map, as a string with long, lat and zoom separated by commas. |
| `baseLayers` | array | no | _null_ | Array with default baselayers to show. One, or many of the following values: "CAWM" "OSM", "EsriSatellite", "EsriStreets", "EsriTopo", "GoogleSatellite", "GoogleRoadmap", "GoogleTerrain", "GoogleAlteredRoadmap", "GoogleTerrainOnly", "GoogleHybrid", "CartoDb", "StamenTerrain", "OSMMapnick", "OSMCycle". |
| `scrollWheelZoom` | boolean | no | _false_ | Boolean value that controles whether zoom wheel is active or not. |
| `layersControlPosition` | string | no | "topright" | Position of the layers control, one of the following values: "topright", "topleft", "bottomright" "bottomleft". |

`MapLeaflet` accepts none, one or more `VectorLayer` and/or `RasterLayer` instances as child components


### VectorLayer

The `VectorLayer` component can be used to import, display, and customize your geographical vector data in the map. It must be used as a child of `MapLeaflet` component. A vector layer can be populated with data from different sources, such as:
- a local GeoJSON file
- a remote GeoJSON file
- a table of Directus instance containing geographical data.

**Props**

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `source` | object | yes |  | For the complete documentation: [Access data from components](#access-data-from-components). |
| `name` | string | yes |  | Layer name to use in the Layer control |
| `popupTemplate` | string | no | _null_ | A string containing the HTML to render in the popup. Variable propertirs can be used using ${field_name} syntax. |
| `pointToLayer` | function | no | _null_ | A function defining how GeoJSON points spawn Leaflet layers. It is internally called when data is added, passing the GeoJSON point feature and its LatLng as properties. The default is to spawn a default Marker. Full reference at https://leafletjs.com/reference.html#geojson-pointtolayer. |
| `filter` | function | no | _null_ | A function that will be used to decide whether to include a feature or not in the current visualisation. The default is to include all features (no filter applied). |
| `checked` | boolean | no | true | Boolean property to control the layer's default visibility ion the map and control panel |
| `fitToContent` | boolean | no | _false_ | Boolean property to decide wether to zoom/pan the map to fit the layer extention or not. |


### RasterLayer

The `RasterLayer` components can be used to import and display raster tiles in the map. It must be used as a child of `MapLeaflet` component.
 

**Props**

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `name` | string | yes | _null_ | Name of the baselayer to show in Layer control|
| `url` | string | yes | _null_ | URL where raster tiles are found. |
| `checked` | boolean | no | _false_ | Property to control the layer's default visibility ion the map and control panel. |
| `attribution` | string | no | _null_ | Attribution or credits for the layer. |
| `asOverlay` | boolean | no | _false_ | If true the layer will be listed in the Overlay list; if false (default) in the base-layers list. |


### MapLibre

The `MapLibre` component is used to create maps using MapLibre and it is a wrapper around [`react-map-gl`](https://visgl.github.io/react-map-gl/) module. It aims to be a full replacement of the MapLeaflet, by maintaining the same API and possibly providing enhanced functionality, mainly related to the native support for vector tiles.

**Props**

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `height` | string | no | "800px" | Height (with unit) of the map element. |
| `center` | string | no | "0,0,2" | Center of the map, as a string with long, lat and zoom separated by commas. |
| `baseLayers` | array | no | _null_ | Array with default baselayers to show. One, or many of the following values: "CAWM" "OSM", "EsriSatellite", "EsriStreets", "EsriTopo", "GoogleSatellite", "GoogleRoadmap", "GoogleTerrain", "GoogleAlteredRoadmap", "GoogleTerrainOnly", "GoogleHybrid", "CartoDb", "StamenTerrain", "OSMMapnick", "OSMCycle". |
| `scrollWheelZoom` | boolean | no | _false_ | Boolean value that controles whether zoom wheel is active or not. |
| `layersControlPosition` | string | no | "topright" | Position of the layers control, one of the following values: "topright", "topleft", "bottomright" "bottomleft". |

`MapLeaflet` accepts none, one or more `VectorLayer` and/or `RasterLayer` instances as child components

### VectorLayerLibre

The `VectorLayerLibre` component is a React component that renders a vector layer on a map using GeoJSON data. It manages the layer's style, visibility, and data fetching.

**Props**

| Prop | Type | Required | Default value | Description |
|---|---|---|---|---|
| `source` | Object | Yes | _null_ | Data source for the GeoJSON. For the complete documentation: [Access data from components](#access-data-from-components).  |
| `refId` | string | No | _null_ | Reference ID for the layer, as defined in the external styles.json file. It is used to oveerride the layer name / style / popup etc. |
| `style` | Object | No | _null_ | Style configuration for the layer. For the complete documentation see: [https://maplibre.org/maplibre-style-spec/layers/](https://maplibre.org/maplibre-style-spec/layers/)|
| `name` | string | Yes | _null_ | Layer name to use in the Layer control. |
| `searchInFields` | Object | No | _null_ | It can be a flat key:value object, the fieldname being the key and the shown label the value (`"Site_Name": "Site name"`). Or a more complex object with fieldname as the key and an object as the value; label holds the shown lavel and values is an array of predefined values used to populate a select input (`"Item_Label": { label: "Label", values: ["KM 50", "KM 40", "KM 55"] },`). |
| `fitToContent` | boolean | No | false | Whether to fit the map to the content. |
| `checked` | boolean | No | false | Whether the layer is checked/visible. |
| `popupTemplate` | string | No | _null_ | A string containing the HTML to render in the popup. Variable props can be injected using ${field_name} syntax. |

  

### RasterLayerLibre

The `RasterLayerLibre` component is designed to render a raster layer on a MapLibre map. This documentation provides an overview of the component and its props.

**Props**


| Prop | Type | Required | Default value | Description |
|---|---|---|---|---|
| `name` | string | Yes | _null_ | The name of the layer to be displayed in the Control Panel. |
| `url` | string \| string[] | Yes |  _null_ | The URL(s) of the raster tiles. Can be a single string or an array of strings. |
| `checked` | boolean | Yes |  false | Determines if the layer is visible or not. If true, the layer is displayed. |
| `attribution` | string | No |  _null_ |Optional attribution or credits for the layer. |


### DataTb

The `DataTb` component displays data ordered in a two-dimensional table. It can be populated with data from a Directud API endpoint, a static CSV or JSON files hosted locally or in the WWW. Under the hood DataTb uses the [React Data Table Component](https://react-data-table-component.netlify.app/?path=/docs/getting-started-intro--docs) and supports out of the box all configurations and settings described on the [official documentation](https://react-data-table-component.netlify.app/?path=/docs/getting-started-intro--docs). An example of these settings is provided below:

**Props**

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `source` | object | yes |  _null_ | For the complete documentation: [Access data from components](#access-data-from-components). |
| `columns` | object | yes | _null_ | Object containing information on the columns of the table. The full documentation is available in the [official documentation](https://react-data-table-component.netlify.app/?path=/docs/api-columns--docs)|
| `...props` |  |  |  | All parameters described in the [official React Data Table Component documentation](https://react-data-table-component.netlify.app/?path=/docs/api-props--docs) can be used with this component. |



## Search

The `Search` component is a React component that provides a user interface for searching data from a specified source. It allows users to input search criteria and displays the results based on a provided template.

**Props**


| Prop Name | Type | Required | Default value | Description |
| --- |--- | --- | --- | --- |
| `source` | Object | Yes | _null_ | An object containing information to source data. This should include the necessary properties for querying the data source. [More info on source object](#access-data-from-components)|
| `resultItemTemplate`| Function | Yes | _null_ | A template function to render each result item. This function receives an item from the search results and should return a React element. |
| `resultsHeaderTemplate` | Function | No | `tot => ( <> <h1 className="mt-5">Results</h1> <p className="text-secondary">— {tot} records found</p> </> )` | Template function to render the header of the results. Default is a simple header in English with the number of results.|
| `fieldList` | Object | Yes | _null_ | An object defining the fields available for querying. |
| `operators` | Object | No | <pre lang="json">{<br> "_eq": "Equals",<br> "_neq": "Doesn't equal",<br> "_lt": "Less  than",<br> "_lte": "Less than or equal to",<br> "_gt": "Greater than",<br> "_gte": "Greater than or equal to",<br> "_null": "Is null",<br> "_nnull": "Isn't null",<br> "_contains": "Contains",<br> "_icontains": "Contains (case-insensitive)",<br> "_ncontains": "Doesn't contain",<br> "_starts_with": "Starts with",<br> "_istarts_with": "Starts with (case-insensitive)",<br> "_nstarts_with": "Doesn't start with",<br> "_nistarts_with": "Doesn't start with (case-insensitive)",<br> "_ends_with": "Ends with",<br> "_iends_with": "Ends with (case-insensitive)",<br> "_nends_with": "Doesn't end with",<br> "_niends_with": "Doesn't end with (case-insensitive)",<br> "_empty": "Is empty",<br> "_nempty": "Isn't empty"<br> }</pre> | An object containing the identifiers of the operators (keys) and the labels to use for the UI. This can be used to overwrite default options, for example, to have the UI translated in a different language. |
| `connector` | Object | No | <pre lang="json">{<br> "_and": "AND",<br> "_or": "OR"<br>}</pre> | An object containing the logical connectors (keys) and the labels to use for the UI. This can be used to overwrite the default value, for example, to have the UI translated in a different language. |




### Record

The `Record` component is a React component that fetches and provides record data based on specified search parameters. It handles loading and error states and renders its children once the data is available. The component utilizes the React Context API to provide the fetched record data to its descendants.

**Props**
| Prop Name | Type | Required | Default value | Description |
|---|---|----|---|---|
| `search` | Object | Yes | _null_ | An object containing the search parameters. |
| `search.tb` | String | YES | _null_ | The name of the Directus table to fetch data from. |
| `search.endPoint` | String | No if env variable `dEndPoint` is set | _null_ | The Directus endpoint to fetch data from. |
| `search.token` | String | No if env variable `dToken` is set | The Directus token for authentication (optional). |
| `search.id` | String | Yes | _null_ | The ID of the record to fetch. |
| `search.fields` | String | Yes | _null_ | Record fields to fetch, following: [https://docs.directus.io/reference/query.html#fields](https://docs.directus.io/reference/query.html#fields). |
| `children`| ReactNode | Yes | _null_ | Child components to render once the data is fetched. `Field` component can be used to show data for specific field. |


### Field

The `Field` component is a React component that retrieves and displays data from the `Record`. It allows for optional transformation of the data before rendering.


**Props**
| Prop Name | Type | Required | Default value | Description |
|---|---|----|---|---|
| `name` | Array<string> | Yes | _null_ | An array of strings representing the keys or indices of the data to retrieve. <br> Example: <br> If the data is {"one": "One Value", "two": ["Two value #1", "Two value 2"]}, then name: ["one"] will return "One Value" and name: ["two", "1"] will return "Two value 2". |
| `transformer` | Function (optional) | No | `JSON.stringify`, if data is not a string | A function that receives the retrieved data as input and performs transformation or any other type of logic. <br> Example: You can use this to loop through an array of child data. <br> If not provided, the component will use JSON.stringify on non-string data. |


### Image

The `Image` component is a React component that displays images based on a specified field name and index. It retrieves image data from the `RecordContext` and constructs the image URL dynamically. This component is useful for rendering images from a data source, such as a CMS.


**Props**
| Prop Name | Type | Required | Default value | Description |
|---|---|----|---|---|
| `fieldName` | String | Yes  | _null_ | The name of the field to retrieve image data from. |
| `index`     | oneOf(['all', number]) | No       | `0`           | The index of the image to display; can be `"all"` to show all images. |
| `dEndPoint` | string | No | `process.env.GATSBY_DIRECTUS_ENDPOINT` | Optional custom endpoint for fetching images. |
| `preset`    | String | No | _null_ | Optional preset key for image transformation. as defined in [https://docs.directus.io/reference/files.html#preset-transformations](https://docs.directus.io/reference/files.html#preset-transformations)|
| `custom`    | String | No | _null_ | Optional custom query parameters for the image URL, as defined in [https://docs.directus.io/reference/files.html#custom-transformations](https://docs.directus.io/reference/files.html#custom-transformations) |
| `className` | String | No | _null_ | Optional CSS class for styling the image. |


### HarrisMatrix

The `HarrisMatrix` component renders a directed graph using viz.js from a DOT string or an array of edges. It supports zoom controls and node click events.

**Props**

| Prop Name | Type | Required | Default value | Description |
|----------|------|-------------------|---------------|-------------|
| `dot` | string | no (required if `data` is not set) | _null_ | The DOT string representing the graph. |
| `data` | array | no (required if `dot` is not set) | [] | The array of edges representing the graph. Each edge is represented as an array of two strings. |
| `width` | string | no | "100%" | The width of the graph container. |
| `height` | string | no | "400px" | The height of the graph container. |
| `containerClassNames` | string | no | _null_ | Additional class names for the container. |
| `onClickNode` | function | no | `nodeText => { console.log(nodeText) }` | Function to call when a node is clicked. The node's text is passed as a parameter. |

---

## Built with s:CMS
- [Borderscape](https://webgis.borderscapeproject.org/): WebGIS State Formation and Settlement Patterns in the Ancient Egyptian Southern Border, 4th-3rd millennia BCE
- [ElaMortuary](https://lad-sapienza.github.io/elamortuary/): Villages to Empire: 4,000 Years of Death and Society in Elam (4500-525 BCE)
- [Pre-Islamic Afghanistan](https://lad-sapienza.github.io/pre-islamic-afghanistan/): Archaeology and cultural heritage of pre-Islamic Afghanistan: Sites and materials. With a focus on the Buddhist clay sculptures