import * as nanocurrency from 'nanocurrency'
import * as bigInt from 'big-integer';
import * as webglpow from './modules/nano-webgl-pow.js'
import * as blake from 'blakejs';
import { sha256 } from 'js-sha256';
import { codec } from "rfc4648";
import * as ASCIIFolder from 'fold-to-ascii/lib/ascii-folder';

const representative = 'nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd';
const messagePrice = '190000000000000000000000000'
const maxMessageBlock = 50
const encoding = {
  chars: "13456789abcdefghijkmnopqrstuwxyz",
  bits: 5,
};

export async function getSeed() {
    let seed = localStorage.getItem('seed');
    if (seed && seed.length === 64) {
        return seed;
    }
    seed = await nanocurrency.generateSeed();
    localStorage.setItem('seed', seed);
    localStorage.setItem('index', 0);
    return seed;
}

export async function getSecretKey() {
    const seed = await getSeed();
    const index = localStorage.getItem('index');
    const secretKey = await nanocurrency.deriveSecretKey(seed, parseInt(index));
    return secretKey;
}

export async function getPublicKey() {
    const secretKey = await getSecretKey();
    const publicKey = await nanocurrency.derivePublicKey(secretKey);
    return publicKey;
}

export async function getCurrentAddr() {
    const publicKey = await getPublicKey();
    const address = await nanocurrency.deriveAddress(publicKey, {useNanoPrefix: true});
    return address;
}

export async function getNextAddress() {
    const seed = await getSeed();
    const index = parseInt(localStorage.getItem('index')) + 1;
    const secretKey = await nanocurrency.deriveSecretKey(seed, index);
    const publicKey = await nanocurrency.derivePublicKey(secretKey);
    const address = await nanocurrency.deriveAddress(publicKey, {useNanoPrefix: true});
    return address;
}

export function incrementAddressIndex() {
    const index = parseInt(localStorage.getItem('index')) + 1;
    localStorage.setItem('index', index);
}

export async function getDifficulty() {
    const lastCheck = localStorage.getItem('last_difficulty_check');
    if (lastCheck < Date.now() - (5 * 60 * 1000)) {
        const res = await fetch("https://proxy.nanos.cc/proxy/?action=active_difficulty").then(res => res.json())
        const difficulty = {receive: res.network_receive_current, send: res.network_current};
        localStorage.setItem('difficulty', JSON.stringify(difficulty));
        localStorage.setItem('last_difficulty_check', Date.now());
        return difficulty;
    }
    return JSON.parse(localStorage.getItem('difficulty'));
}

export async function getAccountInfo(address) {
    return await fetch("https://proxy.nanos.cc/proxy/?action=account_info&account=" + address).then(res => res.json())
}

export async function getAccountHistory(address) {
    return await fetch("https://proxy.nanos.cc/proxy/?action=account_history&account=" + address).then(res => res.json())
}

export async function getPending(address, threshold = 1) {
    return await fetch("https://proxy.nanos.cc/proxy/?action=pending&count=1000&source=true&sorting=true&account=" + address + "&threshold=" + threshold).then(res => res.json())
}

export async function computeWork(hash, type) {
    try {
        const cloudWork = await fetch('https://vox.nanos.cc/api', {
            method: 'post',
            body: '{"action": "work_generate", "hash": "' + hash + '"}',
            headers: {
              'Content-Type': 'application/json'
            },
        }).then(res => res.json());
        if (cloudWork && cloudWork.work && nanocurrency.checkWork(cloudWork.work)) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(cloudWork.work);
                }, 500)
            })
        }
    } catch (e) {}
    const difficulty = await getDifficulty();
    return new Promise(resolve => {
        const realDifficulty = '0x' + (difficulty[type].slice(0, -8))
        webglpow.calculate(hash, realDifficulty, 1024, 256,
            (work, n) => {
                resolve(work);
          }
      )
    })
}

export async function processBlock(block, type) {
    let blockString = "";
    Object.keys(block).map(function(key, index) {
        blockString += "&block[" + key + "]=" + block[key];
        return 0;
    });
    const res = await fetch("https://proxy.nanos.cc/proxy/?action=process&json_block=true&subtype=" + type + (encodeURIComponent(blockString).replace(/%26/g, '&').replace(/%3D/g, '='))).then(res => res.json());
    return res.hash;
}

export async function receiveAll(progressCallback) {
    const address = await getCurrentAddr();
    const publicKey = await getPublicKey();
    const secretKey = await getSecretKey();
    const accountInfo = await getAccountInfo(address);
    let balance = bigInt(0)
    let frontier = null;
    if (accountInfo.balance && accountInfo.frontier) {
        balance = bigInt(accountInfo.balance)
        frontier = accountInfo.frontier;
    }
    const pending = await getPending(address)
    const hashes = Object.keys(pending.blocks);
    for (let i = 0; i < hashes.length; i++) {
        if (progressCallback) {
            progressCallback({done: i, total: hashes.length})
        }
        const block = pending.blocks[hashes[i]];
        balance = balance.add(block.amount);
        const receiveBlock = await nanocurrency.createBlock(secretKey, {balance: balance.toString(), representative: representative, work: "", link: hashes[i], previous: frontier})
        const work = await computeWork(frontier ? frontier : publicKey, 'receive')
        receiveBlock.block.work = work
        frontier = await processBlock(receiveBlock.block, 'receive');
    }
    if (progressCallback) {
        progressCallback({done: hashes.length, total: hashes.length})
    }
    return true;
}

export function getMessageSendAddresses(message) {
    message = clearUnicodeChars(message);
    const messageEncoded = encodeMessage(message);
    const chunks = messageEncoded.match(/.{51}/g) || [];
    const addresses = chunks.map(c => {
        return createMessageChunkAddess(c);
    })
    const checksum = addresses.length + '|' + sha256(messageEncoded).substring(0, 30 - addresses.length.toString().length)
    addresses.push(createMessageChunkAddess(encodeMessage(checksum)));
    return addresses;
}

export function getMessageInfo(checksum) {
    const decodedChecksum = decodeMessage(extractMessageFromAddress(checksum)).split('|');
    if (decodedChecksum.length !== 2 || isNaN(decodedChecksum[0])) {
        return {length: 0, hash: '0'.repeat(64)}
    }
    return {length: parseInt(decodedChecksum[0]), hash: decodedChecksum[1]}
}

export function extractMessageFromAddress(address) {
    return address.replace('nano_1', '').replace('xrb_1', '').slice(0, -8)
}

export function encodeMessage(message) {
    let string = '';
    let padding = 0;
    do {
        string = codec.stringify((message + ' '.repeat(padding++)).split('').map((c) => c.charCodeAt(0)), encoding).replace(/=/g, '');
    } while (string.length % 51 !== 0 && (string.length + 1) % 51 !== 0)
    if (string.length % 51 !== 0) {
        string += '9'
    }
    return string;
}

export function clearUnicodeChars(string) {
    const charArray = string.split('');
    const cleanArray = ASCIIFolder.foldReplacing(string, '¤');
    const newCharArray = charArray.map((c, index) => {
        if (c.charCodeAt(0) < 32 || (c.charCodeAt(0) > 144 && c.charCodeAt(0) < 157) || c.charCodeAt(0) > 253) {
            return cleanArray[index];
        }
        return c;
    })
    return newCharArray.join('');
}

export function decodeMessage(message, returnArray = false) {
    let charArray = [];
    for (let i = 0; i < 2; i++) {
        try {
            charArray = codec.parse(message.substring(0, message.length - i), encoding, { loose: true });
            i = 2;
        } catch (err) {}
    }
    if (returnArray) {
        return charArray;
    }
    return String.fromCharCode.apply(null, charArray);
}

export function createMessageChunkAddess(partialAddress) {
    const addressCharArray = decodeMessage('11111' + partialAddress, true).slice(3);
    const checksum = blake.blake2b(addressCharArray, null, 5)
    const checksumString = encodeMessage(String.fromCharCode.apply(null, checksum.reverse())).substring(0, 8);
    return 'nano_1' + partialAddress + checksumString;
}

export async function getBlockTimestamp(hash) {
    const time = sessionStorage.getItem(hash + '_time');
    if (time > 0) {
        return time;
    }
    const res = await fetch('https://mynano.ninja/api/node', {
        method: 'post',
        body: '{"action": "block_info", "hash": "' + hash + '"}',
        headers: {
          'Content-Type': 'application/json'
        },
    }).then(res => res.json());
    sessionStorage.setItem(hash + '_time', res.local_timestamp);
    return res.local_timestamp;
}

export async function sendMessage(message, channelAddress, progressCallback) {
    const sendAddresses = getMessageSendAddresses(message);
    const address = await getCurrentAddr();
    const secretKey = await getSecretKey();
    const accountInfo = await getAccountInfo(address);
    const nextAddress = await getNextAddress();
    if (!accountInfo.balance || !accountInfo.frontier) {
        return false;
    }
    let balance = bigInt(accountInfo.balance)
    let frontier = accountInfo.frontier;
    if (balance.compare(bigInt(sendAddresses.length).add(messagePrice)) < 0) {
        return false;
    }
    for (let i = 0; i < sendAddresses.length + 2; i++) {
        if (progressCallback) {
            progressCallback({done: i, total: sendAddresses.length + 2})
        }
        const sendAddress = (i < sendAddresses.length) ? sendAddresses[i] : (i === sendAddresses.length ? channelAddress : nextAddress);
        if (i !== (sendAddresses.length + 1)) {
            balance = balance.add(bigInt((i < sendAddresses.length) ? 1 : messagePrice).add(parseInt(Date.now()/1000)).multiply(-1));
        }
        else {
            balance = bigInt(0);
        }
        const sendBlock = await nanocurrency.createBlock(secretKey, {balance: balance.toString(), representative: representative, work: "", link: sendAddress, previous: frontier})
        const work = await computeWork(frontier, 'send')
        sendBlock.block.work = work
        frontier = await processBlock(sendBlock.block, 'send');
    }
    incrementAddressIndex();
    if (progressCallback) {
        progressCallback({done: sendAddresses.length + 2, total: sendAddresses.length + 2})
    }
    return true;
}

export async function getMessagesInChannel(channelAddress, limit = 10) {
    const realLimit = limit;
    const messages = [];
    const messagesHashes = await getPending(channelAddress, messagePrice);
    const hashes = Object.keys(messagesHashes.blocks);
    for (let i = 0; (i < hashes.length && i < (limit + 10)); i++) {
        messagesHashes.blocks[hashes[i]].timestamp = await getBlockTimestamp(hashes[i]);
    }
    hashes.sort((a, b) => {
        if (messagesHashes.blocks[a].timestamp > messagesHashes.blocks[b].timestamp) {
            return -1;
        }
        if (messagesHashes.blocks[a].timestamp < messagesHashes.blocks[b].timestamp) {
            return 1;
        }
        return 0;
    });
    for (let i = 0; (i < hashes.length && i < (limit + 10)); i++) {
        if (sessionStorage.getItem(hashes[i]) && sessionStorage.getItem(hashes[i]).length > 10) {
            messages.push(JSON.parse(sessionStorage.getItem(hashes[i])));
            continue;
        }
        const block = messagesHashes.blocks[hashes[i]];
        const source = block.source;
        const history = await getAccountHistory(source);
        const historyBlocks = history.history;
        let found = false;
        for (let j = 0; (j < historyBlocks.length && j < 5); j++) {
            if (historyBlocks[j].hash === hashes[i]) {
                found = j;
                break;
            }
        }
        if (found !== false) {
            const checksumBlock = historyBlocks[found + 1];
            const messageInfo = getMessageInfo(checksumBlock.account)
            const timestamp = historyBlocks[found]['local_timestamp']
            let first_timestamp = 0;
            const blocks = [];
            if (messageInfo.length < 1 || messageInfo.length > maxMessageBlock) {
                continue;
            }
            const chunks = [];
            for (let j = found + 2; j < (messageInfo.length + found + 2); j++) {
                blocks.push(historyBlocks[j].hash)
                chunks.push(extractMessageFromAddress(historyBlocks[j].account));
                if (j === (messageInfo.length + found + 1)) {
                    first_timestamp = historyBlocks[j]['local_timestamp'];
                }
            }
            chunks.reverse();
            blocks.reverse();
            const message = chunks.join('');
            const hash = sha256(message);
            if (hash.substring(0, messageInfo.hash.length) === messageInfo.hash) {
                const messageObj = {author: block.source, timestamp: timestamp, first_timestamp: first_timestamp, message: decodeMessage(message), blocks: blocks, checksum_block: checksumBlock.hash, broadcast_block: hashes[i]};
                messages.push(messageObj);
                sessionStorage.setItem(hashes[i], JSON.stringify(messageObj));
            }
        }
        else {
            limit++;
        }
    }
    return messages.slice(0, realLimit).sort((a, b) => {
        if (a.timestamp > b.timestamp) {
            return -1;
        }
        if (a.timestamp < b.timestamp) {
            return 1;
        }
        return 0;
    });;
}

export async function enoughBalance(chunksCount) {
    const address = await getCurrentAddr();
    const accountInfo = await getAccountInfo(address);
    let balance = bigInt(0)
    if (accountInfo.balance && accountInfo.frontier) {
        balance = bigInt(accountInfo.balance)
    }
    if (balance.compare(bigInt(chunksCount + 1).add(messagePrice)) < 0) {
        return false;
    }
    else {
        return true;
    }
}

export function getChannelAddress(channel) {
    channel = clearUnicodeChars(channel.toLowerCase().trim());
    if (channel === '') {
        channel = ' '
    }
    const channelEncoded = encodeMessage(channel);
    return createMessageChunkAddess("nanomsg1" + channelEncoded.substring(0, 43));
}
