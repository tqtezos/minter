"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.originateContract = exports.compileAndLoadContract = exports.defaultEnv = exports.LigoEnv = void 0;
var child = __importStar(require("child_process"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var logger_1 = require("@tsed/logger");
var LigoEnv = /** @class */ (function () {
    function LigoEnv(cwd, srcDir, outDir) {
        this.cwd = cwd;
        this.srcDir = srcDir;
        this.outDir = outDir;
    }
    LigoEnv.prototype.srcFilePath = function (srcFileName) {
        return path.join(this.srcDir, srcFileName);
    };
    LigoEnv.prototype.outFilePath = function (outFileName) {
        return path.join(this.outDir, outFileName);
    };
    return LigoEnv;
}());
exports.LigoEnv = LigoEnv;
exports.defaultEnv = defaultLigoEnv();
function defaultLigoEnv() {
    var cwd = path.join(__dirname, '..');
    var src = path.join(cwd, 'ligo/src');
    var out = path.join(cwd, 'bin/contracts');
    return new LigoEnv(cwd, src, out);
}
function compileAndLoadContract(env, srcFile, main, dstFile) {
    return __awaiter(this, void 0, void 0, function () {
        var src, out;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    src = env.srcFilePath(srcFile);
                    out = env.outFilePath(dstFile);
                    return [4 /*yield*/, compileContract(env.cwd, src, main, out)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            return fs.readFile(out, function (err, buff) {
                                return err ? reject(err) : resolve(buff.toString());
                            });
                        })];
            }
        });
    });
}
exports.compileAndLoadContract = compileAndLoadContract;
function compileContract(cwd, srcFilePath, main, dstFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var cmd;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cmd = "ligo compile-contract " + srcFilePath + " " + main + " --brief --output=" + dstFilePath;
                    return [4 /*yield*/, runCmd(cwd, cmd)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runCmd(cwd, cmd) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    return child.exec(cmd, { cwd: cwd }, function (err, stdout, errout) {
                        return errout ? reject(errout) : resolve();
                    });
                })];
        });
    });
}
function originateContract(tz, code, storage, name) {
    return __awaiter(this, void 0, void 0, function () {
        var originationOp, contract, error_1, jsonError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, tz.contract.originate({
                            code: code,
                            init: storage
                        })];
                case 1:
                    originationOp = _a.sent();
                    return [4 /*yield*/, originationOp.contract()];
                case 2:
                    contract = _a.sent();
                    logger_1.$log.info("originated contract " + name + " with address " + contract.address);
                    logger_1.$log.info("consumed gas: " + originationOp.consumedGas);
                    return [2 /*return*/, Promise.resolve(contract)];
                case 3:
                    error_1 = _a.sent();
                    jsonError = JSON.stringify(error_1, null, 2);
                    logger_1.$log.fatal(name + " origination error " + jsonError);
                    return [2 /*return*/, Promise.reject(error_1)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.originateContract = originateContract;
