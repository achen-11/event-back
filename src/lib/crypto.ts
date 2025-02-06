import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16
const KEY_LENGTH = 32

export class CryptoService {
  private static instance: CryptoService
  private masterKey: Buffer

  private constructor(masterKey: string) {
    // 使用环境变量中的主密钥
    this.masterKey = Buffer.from(masterKey, 'hex')
  }

  public static getInstance(masterKey: string): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService(masterKey)
    }
    return CryptoService.instance
  }

  private deriveKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      100000, // 迭代次数
      KEY_LENGTH,
      'sha256'
    )
  }

  public encrypt(text: string): string {
    // 生成随机盐值和初始化向量
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)

    // 从主密钥和盐值派生加密密钥
    const key = this.deriveKey(salt)

    // 创建加密器
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // 加密数据
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // 获取认证标签
    const authTag = cipher.getAuthTag()

    // 将所有组件组合成最终的加密字符串
    // 格式：salt:iv:authTag:encryptedData
    return Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64')
  }

  public decrypt(encryptedText: string): string {
    // 将 base64 字符串转换回 Buffer
    const buffer = Buffer.from(encryptedText, 'base64')

    // 提取各个组件
    const salt = buffer.subarray(0, SALT_LENGTH)
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

    // 从主密钥和盐值派生解密密钥
    const key = this.deriveKey(salt)

    // 创建解密器
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    // 解密数据
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')
  }
} 