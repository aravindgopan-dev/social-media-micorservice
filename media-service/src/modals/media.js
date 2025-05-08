"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
var mongoose_1 = require("mongoose");
var mediaSchema = new mongoose_1.default.Schema({
    publicId: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});
exports.Media = mongoose_1.default.model("Media", mediaSchema);
