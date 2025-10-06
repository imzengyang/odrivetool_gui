"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotorState = exports.ControlMode = void 0;
// 控制模式枚举
var ControlMode;
(function (ControlMode) {
    ControlMode["POSITION"] = "position";
    ControlMode["VELOCITY"] = "velocity";
    ControlMode["CURRENT"] = "current";
    ControlMode["VOLTAGE"] = "voltage";
    ControlMode["IDLE"] = "idle";
})(ControlMode || (exports.ControlMode = ControlMode = {}));
// 电机状态枚举
var MotorState;
(function (MotorState) {
    MotorState["IDLE"] = "idle";
    MotorState["STARTUP_CALIBRATION"] = "startup_calibration";
    MotorState["FULL_CALIBRATION_SEQUENCE"] = "full_calibration_sequence";
    MotorState["MOTOR_CALIBRATION"] = "motor_calibration";
    MotorState["SENSORLESS_CONTROL"] = "sensorless_control";
    MotorState["ENCODER_INDEX_SEARCH"] = "encoder_index_search";
    MotorState["ENCODER_OFFSET_CALIBRATION"] = "encoder_offset_calibration";
    MotorState["CLOSED_LOOP_CONTROL"] = "closed_loop_control";
    MotorState["LOCKIN_SPIN"] = "lockin_spin";
    MotorState["ESCAPING"] = "escaping";
})(MotorState || (exports.MotorState = MotorState = {}));
