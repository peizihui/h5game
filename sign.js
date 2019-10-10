/**
 * 私钥：secp256k1(ECDSA)生成私钥(256 bits 随机数/32位)
 */
function generatePrivateKey() {
    var privateKey = null;
    do {
        privateKey =  randomBytes(32)

    }while(!secp256k1.privateKeyVerify(privateKey));
    return privateKey;
}
/**
 * secp256k1(ECDSA)通过私钥生成公钥
 * @param {string} privateKey 私钥
 * @param {boolean} compressed 是否为压缩格式
 */
function generatePublicKey(privateKey, compressed = false) {
    let publicKey = secp256k1.publicKeyCreate(privateKey, compressed);
    return publicKey;
}
/**
 * 导入16进制编码的私钥 
 * @param {string} hexString 16进制编码的私钥
 */
function loadPrivateKeyFromHexString(hexString) {
    if (hexString.slice(0, 2) == '0x') {
        hexString = hexString.slice(2);
    }
    if (hexString.length != 64) {
        return null;
    }
    return new Buffer(hexString, 'hex')
}
/**
 * 地址：公钥的keccak256编码的后20字节，16进制编码的字符串
 * @param {string} publicKey 公钥
 */
function generateAddress(publicKey) {
    return "0x"+createKeccakHash('keccak256').update(publicKey.slice(1)).digest('hex').slice(-40);
}

/**
 * 各种类型数据转buffer
 * @param {*} v 数据
 */
function bufferFrom(v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v)
        } else if (typeof v === 'string') {
            if (util.isHexString(v)) {
                v = Buffer.from(util.padToEven(util.stripHexPrefix(v)), 'hex')
            } else {
                v = Buffer.from(v)
            }
        } else if (typeof v === 'number') {
            v = util.intToBuffer(v)
        } else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0)
        } else if (BN.isBN(v)) {
            v = v.toArrayLike(Buffer)
        } else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray())
        } else {
            throw new Error('invalid type')
        }
    }
    return v
}
/**
 * secp256k1数据签名
 * @param {*} msg 需要签名的数据
 * @param {Buffer} privateKeyBuffer 私钥Buffer
 */
function sign(msg, privateKeyBuffer) {
    if (!secp256k1.privateKeyVerify(privateKeyBuffer)) {
        console.log("Invalid private key！");
        return null;
    }
    // 生成需要签名数据的keccak256哈希
    let hash = createKeccakHash('keccak256').update(msg).digest();
    let sig = secp256k1.sign(hash, privateKeyBuffer);
    let ret = {};
    // 分离签名得到r,s,v
    ret.r = sig.signature.slice(0, 32);
    ret.s = sig.signature.slice(32, 64);
    ret.v = sig.recovery+27;
    return ret;
}

/**
 * 拼接签名
 * @param {Object} ret 
 */
function signBuffer(ret) {
    return Buffer.concat([
        bufferFrom(ret.r),
        bufferFrom(ret.s),
        bufferFrom(ret.v)
    ]);
}

/**
 * 通过签名和原始数据恢复公钥
 * @param {*} r signature[0-32)
 * @param {*} s signature(32,64]
 * @param {*} v recovery(0 or 1)
 * @param {*} msg 原始数据
 */
function recovery(r, s, v, msg) {
    let signature = Buffer.concat([bufferFrom(r), bufferFrom(s)], 64)
    let recovery = v-27;
    if (recovery !== 0 && recovery !== 1) {
        throw new Error('Invalid signature v value')
    }
    let hash = createKeccakHash('keccak256').update(msg).digest();
    let senderPubKey = secp256k1.recover(hash, signature, recovery);
    return secp256k1.publicKeyConvert(senderPubKey, false);
}

/**
 * 
 * @param {*} msg 原始数据
 * @param {*} r signature[0-32)
 * @param {*} s signature(32,64]
 * @param {*} pubKeyBuffer 公钥
 */
function verify(msg, r, s, pubKeyBuffer) {
    let signature = Buffer.concat([bufferFrom(r), bufferFrom(s)], 64)
    let hash = createKeccakHash('keccak256').update(msg).digest();
    return secp256k1.verify(hash, signature, pubKeyBuffer);
}

function signToHex(signRet){
	return "0x"+rlp.encode([[signRet.v],signRet.r,signRet.s]).toString("hex");
}

function signRetFromHex(signHex){
	var signRaw=rlp.decode(signHex);
	let ret = {};
    // 分离签名得到r,s,v
	ret.v = signRaw[0][0];
    ret.r = signRaw[1];
    ret.s = signRaw[2];;
    return ret;
}