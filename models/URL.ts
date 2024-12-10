import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for TypeScript to enforce the schema's structure
interface IURL extends Document {
  filename: string;
  urlMappings: string[];
  status: string;
  createdAt: Date;
}

// Define the schema for the 'urls' collection in the 'ninjadb' database
const urlSchema: Schema = new Schema(
  {
    filename: { type: String, required: true },
    urlMappings: { type: [String], required: true },
    status: { type: String, default: 'unprocessed' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model, specifying the collection name ('urls')
const URL = mongoose.models.URL || mongoose.model<IURL>('URL', urlSchema, 'urls');

export default URL;
