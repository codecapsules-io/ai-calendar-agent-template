import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export class DocumentSplitterUtil {
  static splitDocuments(documents: Document[]): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    return splitter.splitDocuments(documents);
  }
}
