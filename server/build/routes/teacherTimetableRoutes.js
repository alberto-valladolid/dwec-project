"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherController_1 = __importDefault(require("../controllers/teacherController"));
class TeacherTimetableRoutes {
    constructor() {
        this.router = express_1.Router();
        this.config();
    }
    config() {
        this.router.get('/:userId', teacherController_1.default.list);
        this.router.post('/', teacherController_1.default.createTeacher);
        this.router.delete('/:id', teacherController_1.default.deleteTeacher);
        this.router.put('/:id', teacherController_1.default.updateTeacher);
    }
}
const teacherTimetableRoutes = new TeacherTimetableRoutes();
exports.default = teacherTimetableRoutes.router;
