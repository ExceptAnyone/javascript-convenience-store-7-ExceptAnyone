import fs from 'fs/promises';
import path from 'path';

const fileReader = {
  async readProductsFile() {
    return await this.readFile('products.md', '상품');
  },

  async readPromotionsFile() {
    return await this.readFile('promotions.md', '프로모션');
  },

  async readFile(fileName, type) {
    try {
      const content = await this.getFileContent(fileName);
      return this.parseCSV(content);
    } catch (error) {
      throw new Error(`[ERROR] ${type} 목록을 불러오는데 실패했습니다.`);
    }
  },

  async getFileContent(fileName) {
    const filePath = path.join(process.cwd(), `public/${fileName}`);
    const content = await fs.readFile(filePath, 'utf-8');
    return this.validateContent(content, fileName);
  },

  validateContent(content, fileName) {
    if (!content.trim()) {
      const type = fileName.includes('products') ? '상품' : '프로모션';
      throw new Error(`[ERROR] ${type} 목록 파일이 비어있습니다.`);
    }
    return content;
  },

  parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    return this.processLines(lines.slice(1), headers);
  },

  processLines(lines, headers) {
    return lines
      .filter((line) => line.trim())
      .map((line) => this.createObject(line, headers));
  },

  createObject(line, headers) {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  },
};

export default fileReader;
