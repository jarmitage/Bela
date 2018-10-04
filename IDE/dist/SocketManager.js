"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var io = require("socket.io");
var IDE = require("./main");
var project_manager = require("./ProjectManager");
var process_manager = require("./ProcessManager");
var git_manager = require("./GitManager");
var update_manager = require("./UpdateManager");
var project_settings = require("./ProjectSettings");
var ide_settings = require("./IDESettings");
var boot_project = require("./RunOnBoot");
var TerminalManager = require('./TerminalManager');
TerminalManager.on('shell-event', function (evt, data) { return ide_sockets.emit('shell-event', evt, data); });
// all connected sockets
var ide_sockets;
var num_connections = 0;
var interval;
function init(server) {
    ide_sockets = io(server, {
        pingInterval: 3000,
        pingTimeout: 6500
    }).of('/IDE');
    ide_sockets.on('connection', connection);
}
exports.init = init;
function broadcast(event, message) {
    // console.log('broadcasting', event, message);
    if (ide_sockets)
        ide_sockets.emit(event, message);
}
exports.broadcast = broadcast;
function connection(socket) {
    socket.on('set-time', IDE.set_time);
    socket.on('project-event', function (data) { return project_event(socket, data); });
    socket.on('project-settings', function (data) { return project_settings_event(socket, data); });
    socket.on('process-event', function (data) { return process_event(socket, data); });
    socket.on('IDE-settings', function (data) { return ide_settings_event(socket, data); });
    socket.on('git-event', function (data) { return git_event(socket, data); });
    socket.on('list-files', function (project) { return list_files(socket, project); });
    socket.on('run-on-boot', function (project) { return boot_project.set_boot_project(socket, project); });
    socket.on('sh-command', function (cmd) { return TerminalManager.execute(cmd); });
    socket.on('sh-tab', function (cmd) { return TerminalManager.tab(cmd); });
    socket.on('upload-update', function (data) { return update_manager.upload(data); });
    socket.on('shutdown', IDE.shutdown);
    socket.on('disconnect', disconnect);
    init_message(socket);
    TerminalManager.pwd();
    num_connections += 1;
    if (num_connections === 1) {
        interval = setInterval(interval_func, 2000);
    }
}
function disconnect() {
    num_connections = num_connections - 1;
    if (num_connections <= 0 && interval) {
        clearInterval(interval);
    }
}
function interval_func() {
    return __awaiter(this, void 0, void 0, function () {
        var projects;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, project_manager.listProjects()];
                case 1:
                    projects = _a.sent();
                    ide_sockets.emit('project-list', undefined, projects);
                    return [2 /*return*/];
            }
        });
    });
}
function init_message(socket) {
    return __awaiter(this, void 0, void 0, function () {
        var message, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {};
                    return [4 /*yield*/, project_manager.listProjects()];
                case 1:
                    _a.projects = _b.sent();
                    return [4 /*yield*/, project_manager.listExamples()];
                case 2:
                    _a.examples = _b.sent();
                    return [4 /*yield*/, ide_settings.read()];
                case 3:
                    _a.settings = _b.sent();
                    return [4 /*yield*/, boot_project.get_boot_project()];
                case 4:
                    _a.boot_project = _b.sent();
                    return [4 /*yield*/, IDE.board_detect().catch(function (e) { return console.log('error in board detect', e); })];
                case 5:
                    _a.board_string = _b.sent();
                    return [4 /*yield*/, IDE.get_xenomai_version()
                        //	status : await process_manager.status()
                    ];
                case 6:
                    message = (_a.xenomai_version = _b.sent(),
                        _a);
                    socket.emit('init', message);
                    return [2 /*return*/];
            }
        });
    });
}
// Process all websocket events which need to be handled by the ProjectManager
function project_event(socket, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //	console.log('project-event');
                    //	console.dir(data);
                    // reject any malformed websocket message
                    if ((!data.currentProject && !data.newProject) || !data.func || !project_manager[data.func]) {
                        console.log('bad project-event');
                        console.dir(data, { depth: null });
                        return [2 /*return*/];
                    }
                    // call the project_manager function specified in the func field of the ws message
                    return [4 /*yield*/, project_manager[data.func](data)
                            .catch(function (e) {
                            // in the event of an error, log it to the IDE console
                            // and send a string back to the browser for display to the user
                            console.log('project-event error:');
                            console.log(e);
                            data.error = e.toString();
                            socket.emit('project-data', data);
                        })];
                case 1:
                    // call the project_manager function specified in the func field of the ws message
                    _a.sent();
                    //	console.dir(data);
                    // after a succesful operation, send the data back
                    socket.emit('project-data', data);
                    if (data.currentProject) {
                        // save the current project in the IDE settings
                        ide_settings.setIDESetting({ key: 'project', value: data.currentProject });
                        // if a fileList was created, send it to other tabs
                        if (data.fileList)
                            socket.broadcast.emit('file-list', data.currentProject, data.fileList);
                        // if a projectList was created, send it to other tabs
                        if (data.projectList)
                            socket.broadcast.emit('project-list', data.currentProject, data.projectList);
                        // if a file was opened save this in the project settings
                        if (data.fileName)
                            project_settings.set_fileName(data.currentProject, data.fileName);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function project_settings_event(socket, data) {
    return __awaiter(this, void 0, void 0, function () {
        var settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //	console.log('project_settings')
                    //	console.dir(data);
                    if (!data.currentProject || !data.func || !project_settings[data.func]) {
                        console.log('bad project-settings', data);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, project_settings[data.func](data)
                            .catch(function (e) {
                            console.log('project-settings error');
                            console.log(e);
                            socket.emit('report-error', e.toString());
                        })];
                case 1:
                    settings = _a.sent();
                    //	console.log('project_settings')
                    //	console.dir(settings);
                    if (data.func === 'setCLArg') {
                        socket.broadcast.emit('project-settings-data', data.currentProject, settings);
                    }
                    else {
                        ide_sockets.emit('project-settings-data', data.currentProject, settings);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function process_event(socket, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!data || !data.currentProject || !data.event || !process_manager[data.event]) {
                        console.log('bad process-event', data);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, process_manager[data.event](data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function ide_settings_event(socket, data) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!data || !data.func || !ide_settings[data.func]) {
                        console.log('bad ide_settings event', data);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, ide_settings[data.func](data)
                            .catch(function (e) { return console.log('ide_settings error', e); })];
                case 1:
                    result = _a.sent();
                    broadcast('IDE-settings-data', result);
                    return [2 /*return*/];
            }
        });
    });
}
function git_event(socket, data) {
    return __awaiter(this, void 0, void 0, function () {
        var data2, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!data.currentProject || !data.func || !git_manager[data.func]) {
                        console.log('bad git-event', data);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, git_manager[data.func](data)];
                case 2:
                    _a.sent();
                    data2 = {
                        currentProject: data.currentProject,
                        timestamp: data.timestamp,
                        gitData: data
                    };
                    return [4 /*yield*/, project_manager.openProject(data2)];
                case 3:
                    _a.sent();
                    socket.emit('project-data', data2);
                    if (data2.currentProject) {
                        if (data2.projectList) {
                            socket.broadcast.emit('project-list', data2.currentProject, data2.projectList);
                        }
                        if (data2.fileList) {
                            socket.broadcast.emit('file-list', data2.currentProject, data2.fileList);
                        }
                        ide_settings.setIDESetting({ key: 'project', value: data2.currentProject });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log('git-event error', e_1);
                    data.error = e_1.toString();
                    socket.emit('project-data', { gitData: data, timestamp: data.timestamp });
                    socket.emit('report-error', e_1.toString());
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function list_files(socket, project) {
    return __awaiter(this, void 0, void 0, function () {
        var files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, project_manager.listFiles(project)
                        .catch(function (e) { return console.log('error refreshing file list', e.toString()); })];
                case 1:
                    files = _a.sent();
                    socket.emit('file-list', project, files);
                    return [2 /*return*/];
            }
        });
    });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzs7Ozs7O0NBRTNDO0FBRUQsb0JBQTBCLE1BQXVCLEVBQUUsT0FBZTs7Ozs7d0JBQzdCLHFCQUFNLGVBQWUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO3lCQUMxRSxLQUFLLENBQUMsVUFBQyxDQUFRLElBQUssT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUF2RCxDQUF1RCxDQUFFLEVBQUE7O29CQUQzRSxLQUFLLEdBQTJCLFNBQzJDO29CQUMvRSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7O0NBQ3pDIiwiZmlsZSI6IlNvY2tldE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBpbyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIElERSBmcm9tICcuL21haW4nO1xuaW1wb3J0ICogYXMgcHJvamVjdF9tYW5hZ2VyIGZyb20gJy4vUHJvamVjdE1hbmFnZXInO1xuaW1wb3J0ICogYXMgcHJvY2Vzc19tYW5hZ2VyIGZyb20gJy4vUHJvY2Vzc01hbmFnZXInO1xuaW1wb3J0ICogYXMgZ2l0X21hbmFnZXIgZnJvbSAnLi9HaXRNYW5hZ2VyJztcbmltcG9ydCAqIGFzIHVwZGF0ZV9tYW5hZ2VyIGZyb20gJy4vVXBkYXRlTWFuYWdlcic7XG5pbXBvcnQgKiBhcyBwcm9qZWN0X3NldHRpbmdzIGZyb20gJy4vUHJvamVjdFNldHRpbmdzJztcbmltcG9ydCAqIGFzIGlkZV9zZXR0aW5ncyBmcm9tICcuL0lERVNldHRpbmdzJztcbmltcG9ydCAqIGFzIGJvb3RfcHJvamVjdCBmcm9tICcuL1J1bk9uQm9vdCc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbHMnO1xudmFyIFRlcm1pbmFsTWFuYWdlciA9IHJlcXVpcmUoJy4vVGVybWluYWxNYW5hZ2VyJyk7XG5UZXJtaW5hbE1hbmFnZXIub24oJ3NoZWxsLWV2ZW50JywgKGV2dDogYW55LCBkYXRhOiBhbnkpID0+IGlkZV9zb2NrZXRzLmVtaXQoJ3NoZWxsLWV2ZW50JywgZXZ0LCBkYXRhKSApO1xuXG4vLyBhbGwgY29ubmVjdGVkIHNvY2tldHNcbmxldCBpZGVfc29ja2V0czogU29ja2V0SU8uTmFtZXNwYWNlO1xubGV0IG51bV9jb25uZWN0aW9uczogbnVtYmVyID0gMDtcbmxldCBpbnRlcnZhbDogTm9kZUpTLlRpbWVyO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChzZXJ2ZXI6IGh0dHAuU2VydmVyKXtcblx0aWRlX3NvY2tldHMgPSBpbyhzZXJ2ZXIsIHtcblx0XHRwaW5nSW50ZXJ2YWw6IDMwMDAsXG5cdFx0cGluZ1RpbWVvdXQ6IDY1MDBcblx0fSkub2YoJy9JREUnKTtcblx0aWRlX3NvY2tldHMub24oJ2Nvbm5lY3Rpb24nLCBjb25uZWN0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJyb2FkY2FzdChldmVudDogc3RyaW5nLCBtZXNzYWdlOiBhbnkpe1xuXHQvLyBjb25zb2xlLmxvZygnYnJvYWRjYXN0aW5nJywgZXZlbnQsIG1lc3NhZ2UpO1xuXHRpZiAoaWRlX3NvY2tldHMpIGlkZV9zb2NrZXRzLmVtaXQoZXZlbnQsIG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiBjb25uZWN0aW9uKHNvY2tldDogU29ja2V0SU8uU29ja2V0KXtcblx0c29ja2V0Lm9uKCdzZXQtdGltZScsIElERS5zZXRfdGltZSk7XG5cdHNvY2tldC5vbigncHJvamVjdC1ldmVudCcsIChkYXRhOiBhbnkpID0+IHByb2plY3RfZXZlbnQoc29ja2V0LCBkYXRhKSApO1xuXHRzb2NrZXQub24oJ3Byb2plY3Qtc2V0dGluZ3MnLCAoZGF0YTogYW55KSA9PiBwcm9qZWN0X3NldHRpbmdzX2V2ZW50KHNvY2tldCwgZGF0YSkgKTtcblx0c29ja2V0Lm9uKCdwcm9jZXNzLWV2ZW50JywgKGRhdGE6IGFueSkgPT4gcHJvY2Vzc19ldmVudChzb2NrZXQsIGRhdGEpICk7XG5cdHNvY2tldC5vbignSURFLXNldHRpbmdzJywgKGRhdGE6IGFueSkgPT4gaWRlX3NldHRpbmdzX2V2ZW50KHNvY2tldCwgZGF0YSkgKTtcblx0c29ja2V0Lm9uKCdnaXQtZXZlbnQnLCAoZGF0YTogYW55KSA9PiBnaXRfZXZlbnQoc29ja2V0LCBkYXRhKSApO1xuXHRzb2NrZXQub24oJ2xpc3QtZmlsZXMnLCAocHJvamVjdDogc3RyaW5nKSA9PiBsaXN0X2ZpbGVzKHNvY2tldCwgcHJvamVjdCkgKTtcblx0c29ja2V0Lm9uKCdydW4tb24tYm9vdCcsIChwcm9qZWN0OiBzdHJpbmcpID0+IGJvb3RfcHJvamVjdC5zZXRfYm9vdF9wcm9qZWN0KHNvY2tldCwgcHJvamVjdCkgKTtcblx0c29ja2V0Lm9uKCdzaC1jb21tYW5kJywgY21kID0+IFRlcm1pbmFsTWFuYWdlci5leGVjdXRlKGNtZCkgKTtcblx0c29ja2V0Lm9uKCdzaC10YWInLCBjbWQgPT4gVGVybWluYWxNYW5hZ2VyLnRhYihjbWQpICk7XG5cdHNvY2tldC5vbigndXBsb2FkLXVwZGF0ZScsIChkYXRhOiBhbnkpID0+IHVwZGF0ZV9tYW5hZ2VyLnVwbG9hZChkYXRhKSApO1xuXHRzb2NrZXQub24oJ3NodXRkb3duJywgSURFLnNodXRkb3duKTtcblx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZGlzY29ubmVjdCk7XG5cdGluaXRfbWVzc2FnZShzb2NrZXQpO1xuXHRUZXJtaW5hbE1hbmFnZXIucHdkKCk7XG5cdG51bV9jb25uZWN0aW9ucyArPSAxO1xuXHRpZiAobnVtX2Nvbm5lY3Rpb25zID09PSAxKXtcblx0XHRpbnRlcnZhbCA9IHNldEludGVydmFsKGludGVydmFsX2Z1bmMsIDIwMDApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGRpc2Nvbm5lY3QoKXtcblx0bnVtX2Nvbm5lY3Rpb25zID0gbnVtX2Nvbm5lY3Rpb25zIC0gMTtcblx0aWYgKG51bV9jb25uZWN0aW9ucyA8PSAwICYmIGludGVydmFsKXtcblx0XHRjbGVhckludGVydmFsKGludGVydmFsKTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBpbnRlcnZhbF9mdW5jKCl7XG5cdGxldCBwcm9qZWN0czogc3RyaW5nW10gPSBhd2FpdCBwcm9qZWN0X21hbmFnZXIubGlzdFByb2plY3RzKCk7XG5cdGlkZV9zb2NrZXRzLmVtaXQoJ3Byb2plY3QtbGlzdCcsIHVuZGVmaW5lZCwgcHJvamVjdHMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0X21lc3NhZ2Uoc29ja2V0OiBTb2NrZXRJTy5Tb2NrZXQpe1xuXHRsZXQgbWVzc2FnZTogdXRpbC5Jbml0X01lc3NhZ2UgPSB7XG5cdFx0cHJvamVjdHMgXHQ6IGF3YWl0IHByb2plY3RfbWFuYWdlci5saXN0UHJvamVjdHMoKSxcblx0XHRleGFtcGxlcyBcdDogYXdhaXQgcHJvamVjdF9tYW5hZ2VyLmxpc3RFeGFtcGxlcygpLFxuXHRcdHNldHRpbmdzIFx0OiBhd2FpdCBpZGVfc2V0dGluZ3MucmVhZCgpLFxuXHRcdGJvb3RfcHJvamVjdCBcdDogYXdhaXQgYm9vdF9wcm9qZWN0LmdldF9ib290X3Byb2plY3QoKSxcblx0XHRib2FyZF9zdHJpbmdcdDogYXdhaXQgSURFLmJvYXJkX2RldGVjdCgpLmNhdGNoKGUgPT4gY29uc29sZS5sb2coJ2Vycm9yIGluIGJvYXJkIGRldGVjdCcsIGUpKSxcblx0XHR4ZW5vbWFpX3ZlcnNpb24gOiBhd2FpdCBJREUuZ2V0X3hlbm9tYWlfdmVyc2lvbigpXG4vL1x0c3RhdHVzIDogYXdhaXQgcHJvY2Vzc19tYW5hZ2VyLnN0YXR1cygpXG5cdH07XG5cdHNvY2tldC5lbWl0KCdpbml0JywgbWVzc2FnZSk7XG59XG5cbi8vIFByb2Nlc3MgYWxsIHdlYnNvY2tldCBldmVudHMgd2hpY2ggbmVlZCB0byBiZSBoYW5kbGVkIGJ5IHRoZSBQcm9qZWN0TWFuYWdlclxuYXN5bmMgZnVuY3Rpb24gcHJvamVjdF9ldmVudChzb2NrZXQ6IFNvY2tldElPLlNvY2tldCwgZGF0YTogYW55KXtcbi8vXHRjb25zb2xlLmxvZygncHJvamVjdC1ldmVudCcpO1xuLy9cdGNvbnNvbGUuZGlyKGRhdGEpO1xuXHQvLyByZWplY3QgYW55IG1hbGZvcm1lZCB3ZWJzb2NrZXQgbWVzc2FnZVxuXHRpZiAoKCFkYXRhLmN1cnJlbnRQcm9qZWN0ICYmICFkYXRhLm5ld1Byb2plY3QpIHx8ICFkYXRhLmZ1bmMgfHwgIShwcm9qZWN0X21hbmFnZXIgYXMgYW55KVtkYXRhLmZ1bmNdKSB7XG5cdFx0Y29uc29sZS5sb2coJ2JhZCBwcm9qZWN0LWV2ZW50Jyk7XG5cdFx0Y29uc29sZS5kaXIoZGF0YSwge2RlcHRoOm51bGx9KTtcblx0XHRyZXR1cm47XG5cdH1cblx0Ly8gY2FsbCB0aGUgcHJvamVjdF9tYW5hZ2VyIGZ1bmN0aW9uIHNwZWNpZmllZCBpbiB0aGUgZnVuYyBmaWVsZCBvZiB0aGUgd3MgbWVzc2FnZVxuXHRhd2FpdCAocHJvamVjdF9tYW5hZ2VyIGFzIGFueSlbZGF0YS5mdW5jXShkYXRhKVxuXHRcdC5jYXRjaCggKGU6IEVycm9yKSA9PiB7XG5cdFx0XHQvLyBpbiB0aGUgZXZlbnQgb2YgYW4gZXJyb3IsIGxvZyBpdCB0byB0aGUgSURFIGNvbnNvbGVcblx0XHRcdC8vIGFuZCBzZW5kIGEgc3RyaW5nIGJhY2sgdG8gdGhlIGJyb3dzZXIgZm9yIGRpc3BsYXkgdG8gdGhlIHVzZXJcblx0XHRcdGNvbnNvbGUubG9nKCdwcm9qZWN0LWV2ZW50IGVycm9yOicpO1xuXHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHRkYXRhLmVycm9yID0gZS50b1N0cmluZygpO1xuXHRcdFx0c29ja2V0LmVtaXQoJ3Byb2plY3QtZGF0YScsIGRhdGEpO1xuXHRcdH0pO1xuLy9cdGNvbnNvbGUuZGlyKGRhdGEpO1xuXHQvLyBhZnRlciBhIHN1Y2Nlc2Z1bCBvcGVyYXRpb24sIHNlbmQgdGhlIGRhdGEgYmFja1xuXHRzb2NrZXQuZW1pdCgncHJvamVjdC1kYXRhJywgZGF0YSk7XG5cdGlmIChkYXRhLmN1cnJlbnRQcm9qZWN0KXtcblx0XHQvLyBzYXZlIHRoZSBjdXJyZW50IHByb2plY3QgaW4gdGhlIElERSBzZXR0aW5nc1xuXHRcdGlkZV9zZXR0aW5ncy5zZXRJREVTZXR0aW5nKHtrZXk6ICdwcm9qZWN0JywgdmFsdWU6IGRhdGEuY3VycmVudFByb2plY3R9KTtcblx0XHQvLyBpZiBhIGZpbGVMaXN0IHdhcyBjcmVhdGVkLCBzZW5kIGl0IHRvIG90aGVyIHRhYnNcblx0XHRpZiAoZGF0YS5maWxlTGlzdClcblx0XHRcdHNvY2tldC5icm9hZGNhc3QuZW1pdCgnZmlsZS1saXN0JywgZGF0YS5jdXJyZW50UHJvamVjdCwgZGF0YS5maWxlTGlzdCk7XG5cdFx0Ly8gaWYgYSBwcm9qZWN0TGlzdCB3YXMgY3JlYXRlZCwgc2VuZCBpdCB0byBvdGhlciB0YWJzXG5cdFx0aWYgKGRhdGEucHJvamVjdExpc3QpXG5cdFx0XHRzb2NrZXQuYnJvYWRjYXN0LmVtaXQoJ3Byb2plY3QtbGlzdCcsIGRhdGEuY3VycmVudFByb2plY3QsIGRhdGEucHJvamVjdExpc3QpO1xuXHRcdC8vIGlmIGEgZmlsZSB3YXMgb3BlbmVkIHNhdmUgdGhpcyBpbiB0aGUgcHJvamVjdCBzZXR0aW5nc1xuXHRcdGlmIChkYXRhLmZpbGVOYW1lKVxuXHRcdFx0cHJvamVjdF9zZXR0aW5ncy5zZXRfZmlsZU5hbWUoZGF0YS5jdXJyZW50UHJvamVjdCwgZGF0YS5maWxlTmFtZSk7XG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvamVjdF9zZXR0aW5nc19ldmVudChzb2NrZXQ6IFNvY2tldElPLlNvY2tldCwgZGF0YTogYW55KXtcbi8vXHRjb25zb2xlLmxvZygncHJvamVjdF9zZXR0aW5ncycpXG4vL1x0Y29uc29sZS5kaXIoZGF0YSk7XG5cdGlmICghZGF0YS5jdXJyZW50UHJvamVjdCB8fCAhZGF0YS5mdW5jIHx8ICEocHJvamVjdF9zZXR0aW5ncyBhcyBhbnkpW2RhdGEuZnVuY10pIHtcblx0XHRjb25zb2xlLmxvZygnYmFkIHByb2plY3Qtc2V0dGluZ3MnLCBkYXRhKTtcblx0XHRyZXR1cm47XG5cdH1cblx0bGV0IHNldHRpbmdzID0gYXdhaXQgKHByb2plY3Rfc2V0dGluZ3MgYXMgYW55KVtkYXRhLmZ1bmNdKGRhdGEpXG5cdFx0LmNhdGNoKCAoZTogRXJyb3IpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCdwcm9qZWN0LXNldHRpbmdzIGVycm9yJyk7XG5cdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdHNvY2tldC5lbWl0KCdyZXBvcnQtZXJyb3InLCBlLnRvU3RyaW5nKCkpO1xuXHRcdH0pO1xuLy9cdGNvbnNvbGUubG9nKCdwcm9qZWN0X3NldHRpbmdzJylcbi8vXHRjb25zb2xlLmRpcihzZXR0aW5ncyk7XG5cdGlmIChkYXRhLmZ1bmMgPT09ICdzZXRDTEFyZycpe1xuXHRcdHNvY2tldC5icm9hZGNhc3QuZW1pdCgncHJvamVjdC1zZXR0aW5ncy1kYXRhJywgZGF0YS5jdXJyZW50UHJvamVjdCwgc2V0dGluZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdGlkZV9zb2NrZXRzLmVtaXQoJ3Byb2plY3Qtc2V0dGluZ3MtZGF0YScsIGRhdGEuY3VycmVudFByb2plY3QsIHNldHRpbmdzKTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzX2V2ZW50KHNvY2tldDogU29ja2V0SU8uU29ja2V0LCBkYXRhOiBhbnkpe1xuXHRpZiAoIWRhdGEgfHwgIWRhdGEuY3VycmVudFByb2plY3QgfHwgIWRhdGEuZXZlbnQgfHwgIShwcm9jZXNzX21hbmFnZXIgYXMgYW55KVtkYXRhLmV2ZW50XSl7XG5cdFx0Y29uc29sZS5sb2coJ2JhZCBwcm9jZXNzLWV2ZW50JywgZGF0YSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGF3YWl0IChwcm9jZXNzX21hbmFnZXIgYXMgYW55KVtkYXRhLmV2ZW50XShkYXRhKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaWRlX3NldHRpbmdzX2V2ZW50KHNvY2tldDogU29ja2V0SU8uU29ja2V0LCBkYXRhOiBhbnkpe1xuXHRpZiAoIWRhdGEgfHwgIWRhdGEuZnVuYyB8fCAhKGlkZV9zZXR0aW5ncyBhcyBhbnkpW2RhdGEuZnVuY10pe1xuXHRcdGNvbnNvbGUubG9nKCdiYWQgaWRlX3NldHRpbmdzIGV2ZW50JywgZGF0YSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGxldCByZXN1bHQgPSBhd2FpdCAoaWRlX3NldHRpbmdzIGFzIGFueSlbZGF0YS5mdW5jXShkYXRhKVxuXHRcdC5jYXRjaCggKGU6IEVycm9yKSA9PiBjb25zb2xlLmxvZygnaWRlX3NldHRpbmdzIGVycm9yJywgZSkgKTtcblx0YnJvYWRjYXN0KCdJREUtc2V0dGluZ3MtZGF0YScsIHJlc3VsdCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdpdF9ldmVudChzb2NrZXQ6IFNvY2tldElPLlNvY2tldCwgZGF0YTogYW55KXtcblx0aWYgKCFkYXRhLmN1cnJlbnRQcm9qZWN0IHx8ICFkYXRhLmZ1bmMgfHwgIShnaXRfbWFuYWdlciBhcyBhbnkpW2RhdGEuZnVuY10pIHtcblx0XHRjb25zb2xlLmxvZygnYmFkIGdpdC1ldmVudCcsIGRhdGEpO1xuXHRcdHJldHVybjtcblx0fVxuXHR0cnl7XG5cdFx0YXdhaXQgKGdpdF9tYW5hZ2VyIGFzIGFueSlbZGF0YS5mdW5jXShkYXRhKTtcblx0XHRsZXQgZGF0YTI6IGFueSA9IHtcblx0XHRcdGN1cnJlbnRQcm9qZWN0OiBkYXRhLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0dGltZXN0YW1wOlx0ZGF0YS50aW1lc3RhbXAsXG5cdFx0XHRnaXREYXRhOlx0ZGF0YVxuXHRcdH07XG5cdFx0YXdhaXQgcHJvamVjdF9tYW5hZ2VyLm9wZW5Qcm9qZWN0KGRhdGEyKTtcblx0XHRzb2NrZXQuZW1pdCgncHJvamVjdC1kYXRhJywgZGF0YTIpO1xuXHRcdGlmIChkYXRhMi5jdXJyZW50UHJvamVjdCl7XG5cdFx0XHRpZiAoZGF0YTIucHJvamVjdExpc3Qpe1xuXHRcdFx0XHRzb2NrZXQuYnJvYWRjYXN0LmVtaXQoJ3Byb2plY3QtbGlzdCcsIGRhdGEyLmN1cnJlbnRQcm9qZWN0LCBkYXRhMi5wcm9qZWN0TGlzdCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZGF0YTIuZmlsZUxpc3Qpe1xuXHRcdFx0XHRzb2NrZXQuYnJvYWRjYXN0LmVtaXQoJ2ZpbGUtbGlzdCcsIGRhdGEyLmN1cnJlbnRQcm9qZWN0LCBkYXRhMi5maWxlTGlzdCk7XG5cdFx0XHR9XG5cdFx0XHRpZGVfc2V0dGluZ3Muc2V0SURFU2V0dGluZyh7a2V5OiAncHJvamVjdCcsIHZhbHVlOiBkYXRhMi5jdXJyZW50UHJvamVjdH0pO1xuXHRcdH1cblx0fVxuXHRjYXRjaChlKXtcblx0XHRjb25zb2xlLmxvZygnZ2l0LWV2ZW50IGVycm9yJywgZSk7XG5cdFx0ZGF0YS5lcnJvciA9IGUudG9TdHJpbmcoKTtcblx0XHRzb2NrZXQuZW1pdCgncHJvamVjdC1kYXRhJywge2dpdERhdGE6IGRhdGEsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXB9KTtcblx0XHRzb2NrZXQuZW1pdCgncmVwb3J0LWVycm9yJywgZS50b1N0cmluZygpKTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBsaXN0X2ZpbGVzKHNvY2tldDogU29ja2V0SU8uU29ja2V0LCBwcm9qZWN0OiBzdHJpbmcpe1xuXHRsZXQgZmlsZXM6IHV0aWwuRmlsZV9EZXNjcmlwdG9yW10gPSBhd2FpdCBwcm9qZWN0X21hbmFnZXIubGlzdEZpbGVzKHByb2plY3QpXG5cdFx0LmNhdGNoKChlOiBFcnJvcikgPT4gY29uc29sZS5sb2coJ2Vycm9yIHJlZnJlc2hpbmcgZmlsZSBsaXN0JywgZS50b1N0cmluZygpKSApO1xuXHRzb2NrZXQuZW1pdCgnZmlsZS1saXN0JywgcHJvamVjdCwgZmlsZXMpO1xufVxuIl19
