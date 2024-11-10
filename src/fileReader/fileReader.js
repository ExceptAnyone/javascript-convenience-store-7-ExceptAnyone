import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fileReader = {
  async readProductsFile() {
    try {
      const filePath = path.join(__dirname, '../../public/products.md');
      const content = await fs.readFile(filePath, 'utf-8');
      if (!content.trim()) {
        throw new Error('[ERROR] 상품 목록 파일이 비어있습니다.');
      }

      return this.parseCSV(content);
    } catch (error) {
      throw new Error('[ERROR] 상품 목록을 불러오는데 실패했습니다.');
    }
  },

  async readPromotionsFile() {
    try {
      const filePath = path.join(__dirname, '../../public/promotions.md');
      const content = await fs.readFile(filePath, 'utf-8');

      if (!content.trim()) {
        throw new Error('[ERROR] 프로모션 목록 파일이 비어있습니다.');
      }

      return this.parseCSV(content);
    } catch (error) {
      throw new Error('[ERROR] 프로모션 목록을 불러오는데 실패했습니다.');
    }
  },

  parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
  },
};

export default fileReader;
