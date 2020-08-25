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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("@tsed/logger");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var async_retry_1 = __importDefault(require("async-retry"));
var configstore_1 = __importDefault(require("configstore"));
var taquito_1 = require("@taquito/taquito");
var signer_1 = require("@taquito/signer");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var env, configFileName, config, toolkit, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    env = process.env['ENV_NAME'];
                    if (!env) {
                        logger_1.$log.error("ENV_NAME environment variable is not set");
                        process.exit(1);
                    }
                    configFileName = path.join(__dirname, "../config/minter." + env + ".json");
                    if (!fs.existsSync(configFileName)) {
                        logger_1.$log.error("Environment config file " + configFileName + " does not exist");
                        process.exit(1);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    logger_1.$log.info("bootstrapping " + env + " environment config...");
                    config = new configstore_1.default('minter', {}, { configPath: configFileName });
                    return [4 /*yield*/, createToolkit(config)];
                case 2:
                    toolkit = _a.sent();
                    return [4 /*yield*/, awaitForNetwork(toolkit)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, bootstrapNft(config, toolkit)];
                case 4:
                    _a.sent();
                    //add bootstrapping of other contracts here
                    process.exit(0);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    logger_1.$log.error("error while bootstrapping environment " + env);
                    logger_1.$log.error(err_1);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function createToolkit(config) {
    return __awaiter(this, void 0, void 0, function () {
        var adminKey, signer, rpc, toolkit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adminKey = config.get('admin.secret');
                    if (!adminKey)
                        throw new Error('cannot read admin secret key');
                    return [4 /*yield*/, signer_1.InMemorySigner.fromSecretKey(adminKey)];
                case 1:
                    signer = _a.sent();
                    rpc = config.get('rpc');
                    if (!rpc)
                        throw new Error('cannot read node rpc');
                    toolkit = new taquito_1.TezosToolkit();
                    toolkit.setProvider({
                        signer: signer,
                        rpc: rpc,
                        config: { confirmationPollingIntervalSecond: 5 }
                    });
                    return [2 /*return*/, toolkit];
            }
        });
    });
}
function awaitForNetwork(tz) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.$log.info('connecting to network...');
                    return [4 /*yield*/, async_retry_1.default(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tz.rpc.getBlockHeader({ block: '1' })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { retries: 6 })];
                case 1:
                    _a.sent();
                    logger_1.$log.info('connected');
                    return [2 /*return*/];
            }
        });
    });
}
function bootstrapNft(config, tz) {
    return __awaiter(this, void 0, void 0, function () {
        var adminAddress, storage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.$log.info('bootstrapping NFT contract..');
                    return [4 /*yield*/, tz.signer.publicKeyHash()];
                case 1:
                    adminAddress = _a.sent();
                    storage = "(Pair (Pair (Pair \"" + adminAddress + "\" True) None) (Pair (Pair {} 0) (Pair {} {})))";
                    return [4 /*yield*/, bootstrapContract(config, tz, 'contracts.nft', 'fa2_multi_nft_asset.tz', storage)];
                case 2:
                    _a.sent();
                    logger_1.$log.info('bootstrapped NFT contract');
                    return [2 /*return*/];
            }
        });
    });
}
function bootstrapContract(config, tz, configKey, contractFilename, contractStorage) {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); });
}
main();
