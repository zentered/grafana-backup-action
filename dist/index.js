import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 726:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __nccwpck_require__) => {

/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "E1": () => (/* binding */ grafanaApiKey),
/* harmony export */   "oY": () => (/* binding */ grafanaOrg),
/* harmony export */   "rZ": () => (/* binding */ overwriteFiles),
/* harmony export */   "yV": () => (/* binding */ outputFolder)
/* harmony export */ });
const grafanaOrg = process.env.GRAFANA_ORG
const grafanaApiKey = process.env.GRAFANA_CLOUD_API_KEY
const outputFolder = process.env.OUTPUT_FOLDER
const overwriteFiles = process.env.OVERWRITE_FILES === 'true'


/***/ }),

/***/ 378:
/***/ ((__webpack_module__, __unused_webpack___webpack_exports__, __nccwpck_require__) => {

__nccwpck_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony import */ var _lib_write_js__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(162);
/* harmony import */ var _lib_grafana_js__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(362);



const writeFiles = []
const dashboards = await (0,_lib_grafana_js__WEBPACK_IMPORTED_MODULE_1__/* .fetchDashboards */ .j2)()
const folders = await (0,_lib_grafana_js__WEBPACK_IMPORTED_MODULE_1__/* .fetchFolders */ .F5)()

writeFiles.push((0,_lib_write_js__WEBPACK_IMPORTED_MODULE_0__/* .write */ .c)('folders.json', folders))
writeFiles.push((0,_lib_write_js__WEBPACK_IMPORTED_MODULE_0__/* .write */ .c)('dashboards.json', dashboards))

for (const d of dashboards) {
  const db = await (0,_lib_grafana_js__WEBPACK_IMPORTED_MODULE_1__/* .fetchDashboard */ .AK)(d.uid)
  writeFiles.push((0,_lib_write_js__WEBPACK_IMPORTED_MODULE_0__/* .write */ .c)(`${d.uri.replace('db/', '')}.json`, db))
}

await Promise.all(writeFiles)

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ 362:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __nccwpck_require__) => {

/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "AK": () => (/* binding */ fetchDashboard),
/* harmony export */   "F5": () => (/* binding */ fetchFolders),
/* harmony export */   "j2": () => (/* binding */ fetchDashboards)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(726);


;

const fetchGrafana = async (query) => {
  try {
    const res = await fetch(`https://${_config_js__WEBPACK_IMPORTED_MODULE_0__/* .grafanaOrg */ .oY}.grafana.net/api/${query}`, {
      headers: {
        Authorization: `Bearer ${_config_js__WEBPACK_IMPORTED_MODULE_0__/* .grafanaApiKey */ .E1}`
      }
    })

    if (!res || !res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`)
      throw new Error('Grafana API error')
    }

    return res.json()
  } catch (err) {
    console.error(err)
    throw new Error('Grafana API error')
  }
}

const fetchFolders = async () => {
  return fetchGrafana('search?type=dash-folder&limit=1000')
}

const fetchDashboards = async () => {
  return fetchGrafana('search?type=dash-db&limit=1000')
}

const fetchDashboard = async (uid) => {
  return fetchGrafana(`dashboards/uid/${uid}`)
}


/***/ }),

/***/ 162:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __nccwpck_require__) => {


// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "c": () => (/* binding */ write)
});

;// CONCATENATED MODULE: external "node:fs/promises"
const promises_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:fs/promises");
;// CONCATENATED MODULE: external "node:path"
const external_node_path_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:path");
// EXTERNAL MODULE: ./config.js
var config = __nccwpck_require__(726);
;// CONCATENATED MODULE: ./lib/write.js


;



const datePrefix = new Date().toISOString().split('T')[0]
const backupDir = config/* overwriteFiles */.rZ
  ? (0,external_node_path_namespaceObject.join)(process.cwd(), config/* outputFolder */.yV)
  : (0,external_node_path_namespaceObject.join)(process.cwd(), config/* outputFolder */.yV, datePrefix)

let backupDirExists = false
const write = async (filename, data) => {
  console.log(`writing: ${filename}`)

  if (!backupDirExists) {
    await (0,promises_namespaceObject.mkdir)(backupDir, { recursive: true })
    backupDirExists = true
  }

  const file = (0,external_node_path_namespaceObject.join)(backupDir, filename)
  await (0,promises_namespaceObject.writeFile)(file, JSON.stringify(data, null, 2))
}


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/async module */
/******/ (() => {
/******/ 	var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 	var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 	var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 	var resolveQueue = (queue) => {
/******/ 		if(queue && !queue.d) {
/******/ 			queue.d = 1;
/******/ 			queue.forEach((fn) => (fn.r--));
/******/ 			queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 		}
/******/ 	}
/******/ 	var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 		if(dep !== null && typeof dep === "object") {
/******/ 			if(dep[webpackQueues]) return dep;
/******/ 			if(dep.then) {
/******/ 				var queue = [];
/******/ 				queue.d = 0;
/******/ 				dep.then((r) => {
/******/ 					obj[webpackExports] = r;
/******/ 					resolveQueue(queue);
/******/ 				}, (e) => {
/******/ 					obj[webpackError] = e;
/******/ 					resolveQueue(queue);
/******/ 				});
/******/ 				var obj = {};
/******/ 				obj[webpackQueues] = (fn) => (fn(queue));
/******/ 				return obj;
/******/ 			}
/******/ 		}
/******/ 		var ret = {};
/******/ 		ret[webpackQueues] = x => {};
/******/ 		ret[webpackExports] = dep;
/******/ 		return ret;
/******/ 	}));
/******/ 	__nccwpck_require__.a = (module, body, hasAwait) => {
/******/ 		var queue;
/******/ 		hasAwait && ((queue = []).d = 1);
/******/ 		var depQueues = new Set();
/******/ 		var exports = module.exports;
/******/ 		var currentDeps;
/******/ 		var outerResolve;
/******/ 		var reject;
/******/ 		var promise = new Promise((resolve, rej) => {
/******/ 			reject = rej;
/******/ 			outerResolve = resolve;
/******/ 		});
/******/ 		promise[webpackExports] = exports;
/******/ 		promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 		module.exports = promise;
/******/ 		body((deps) => {
/******/ 			currentDeps = wrapDeps(deps);
/******/ 			var fn;
/******/ 			var getResult = () => (currentDeps.map((d) => {
/******/ 				if(d[webpackError]) throw d[webpackError];
/******/ 				return d[webpackExports];
/******/ 			}))
/******/ 			var promise = new Promise((resolve) => {
/******/ 				fn = () => (resolve(getResult));
/******/ 				fn.r = 0;
/******/ 				var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 				currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 			});
/******/ 			return fn.r ? promise : getResult();
/******/ 		}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 		queue && (queue.d = 0);
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module used 'module' so it can't be inlined
/******/ var __webpack_exports__ = __nccwpck_require__(378);
/******/ __webpack_exports__ = await __webpack_exports__;
/******/ 
