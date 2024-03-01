require("./seting");
const sessionName = "dimzAI";
const donet = "*Ingin Berdonasi? silahkah hubungi owner:* wa.me/6289603732786";
// Put your number here ex: ["62xxxxxxxxx"]
const {
  default: sansekaiConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
  PHONENUMBER_MCC,
  Browsers, 
  fetchLatestWaWebVersion
} = require("@adiwajshing/baileys");
const { fetchJson } = require('./lib/myfunc')
//di atas gua tambahin PHONENUMBER_MCC
const pino = require("pino");
const readline = require("readline");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const axios = require("axios");
const chalk = require("chalk");
const os = require("os")
const figlet = require("figlet");
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
const pairingCode = process.argv.includes("-code")
const useMobile = process.argv.includes("--mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
//Ini Jga Yg Pairing,UseMobile,rl,question

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};
//package
global.packname = 'Bot By' // ubah aja ini nama sticker
global.author = 'ytta' // ubah aja ini nama sticker

function smsg(conn, m, store) {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = client.decodeJid((m.fromMe && client.user.id) || m.participant || m.key.participant || m.chat || "");
    if (m.isGroup) m.participant = client.decodeJid(m.key.participant) || "";
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg = m.mtype == "viewOnceMessage" ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype];
    m.body =
      m.message.conversation ||
      m.msg.caption ||
      m.msg.text ||
      (m.mtype == "listResponseMessage" && m.msg.singleSelectReply.selectedRowId) ||
      (m.mtype == "buttonsResponseMessage" && m.msg.selectedButtonId) ||
      (m.mtype == "viewOnceMessage" && m.msg.caption) ||
      m.text;
    let quoted = (m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null);
    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
    if (m.quoted) {
      let type = getContentType(quoted);
      m.quoted = m.quoted[type];
      if (["productMessage"].includes(type)) {
        type = getContentType(m.quoted);
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === "string")
        m.quoted = {
          text: m.quoted,
        };
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16 : false;
      m.quoted.sender = client.decodeJid(m.msg.contextInfo.participant);
      m.quoted.fromMe = m.quoted.sender === client.decodeJid(client.user.id);
      m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || "";
      m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        let q = await store.loadMessage(m.chat, m.quoted.id, conn);
        return exports.smsg(conn, q, store);
      };
      let vM = (m.quoted.fakeObj = M.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
        },
        message: quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {}),
      }));

      /**
       *
       * @returns
       */
      m.quoted.delete = () => client.sendMessage(m.quoted.chat, { delete: vM.key });

      /**
       *
       * @param {*} jid
       * @param {*} forceForward
       * @param {*} options
       * @returns
       */
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) => client.copyNForward(jid, vM, forceForward, options);

      /**
       *
       * @returns
       */
      m.quoted.download = () => client.downloadMediaMessage(m.quoted);
    }
  }
  if (m.msg.url) m.download = () => client.downloadMediaMessage(m.msg);
  m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || "";
  /**
   * Reply to this message
   * @param {String|Object} text
   * @param {String|false} chatId
   * @param {Object} options
   */
  m.reply = (text, chatId = m.chat, options = {}) => (Buffer.isBuffer(text) ? client.sendMedia(chatId, text, "file", "", m, { ...options }) : client.sendText(chatId, text, m, { ...options }));
  /**
   * Copy this message
   */
  m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));

  /**
   *
   * @param {*} jid
   * @param {*} forceForward
   * @param {*} options
   * @returns
   */
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => client.copyNForward(jid, m, forceForward, options);

  return m;
}

async function startHisoka() {
  const { state, saveCreds } = await useMultiFileAuthState(`./${sessionName ? sessionName : "session"}`);
  const { version, isLatest } = await fetchLatestWaWebVersion().catch(() => fetchLatestBaileysVersion());
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  console.log(
    color(
      figlet.textSync("Wa-OpenAI", {
        font: "Standard",
        horizontalLayout: "default",
        vertivalLayout: "default",
        whitespaceBreak: false,
      }),
      "green"
    )
  );

  const client = sansekaiConnect({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !pairingCode,
    browser: ["Chrome (Linux)", "Chrome", "1.0.0"],
    auth: state,
  });
  //Di Atas Gua Ganti Browser

  store.bind(client.ev);

  client.ev.on("messages.upsert", async (chatUpdate) => {
    //console.log(JSON.stringify(chatUpdate, undefined, 2))
    try {
      mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === "status@broadcast") return;
      if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
      m = smsg(client, mek, store);
      require("./sansekai")(client, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });

  // Handle error
  const unhandledRejections = new Map();
  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
  });
  process.on("Something went wrong", function (err) {
    console.log("Caught exception: ", err);
  });

  // Setting
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };
//di bawah ini code pairingcode nya
    if (pairingCode && !client.authState.creds.registered) {
      if (useMobile) throw new Error('Tidak dapat menggunakan kode pemasangan dengan api seluler')

      let phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Ketik nomor anda : `)))
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

      // Ask again when entering the wrong number
      if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
         console.log(chalk.bgBlack(chalk.redBright("Awali dengan kode telepon negara anda, contoh  : 62xxx")))

         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
      }

      let code = await client.requestPairingCode(phoneNumber)
      code = code?.match(/.{1,4}/g)?.join("-") || code
      console.log(chalk.black(chalk.bgGreen(`Kode tautan kamu : `)), chalk.black(chalk.bgWhite(code)))
      rl.close()
   }

  client.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = client.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  client.getName = (jid, withoutContact = false) => {
    id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === client.decodeJid(client.user.id)
          ? client.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  client.setStatus = (status) => {
    client.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    return status;
  };

  client.public = true;

  client.serializeM = (m) => smsg(client, m, store);
 client.ev.on("connection.update", async (update) => {
  if (!update) {
    console.log("Invalid update received");
    return;
  }

  const { connection, lastDisconnect } = update;

  if (connection === "close") {
    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

    if (reason === DisconnectReason.badSession) {
      console.log("Bad Session File, Please Delete Session and Scan Again");
      process.exit();
    } else if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost || reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) {
      console.log("Connection closed, reconnecting...");
      startHisoka();
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
      process.exit();
    } else if (reason === DisconnectReason.loggedOut) {
      console.log("Device Logged Out, Please Delete Folder Session yusril and Scan Again.");
      process.exit();
    } else {
      console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
      startHisoka();
    }
  } else if (connection === "open") {
    console.log("Bot success connected to server");

    if (update.receivedPendingNotifications) {
      const deviceName = os.hostname();
      const message = `=> Status Online ✅`;

      return client.sendMessage(phoneNumber + '@s.whatsapp.net', {
        document: fs.readFileSync("./dimzAI/creds.json"),
        fileName: "[ ✅ Connected To WhatsApp ]",
        mimetype: 'application/fdf',
        fileLength: 9999999,
        caption: message
      }, { quoted: null });
    }
  }
});


  client.ev.on("creds.update", saveCreds);

  const getBuffer = async (url, options) => {
    try {
      options ? options : {};
      const res = await axios({
        method: "get",
        url,
        headers: {
          DNT: 1,
          "Upgrade-Insecure-Request": 1,
        },
        ...options,
        responseType: "arraybuffer",
      });
      return res.data;
    } catch (err) {
      return err;
    }
  };

  client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    return await client.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
  };

  client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text: text, ...options }, { quoted });

  client.cMod = (jid, copy, text = "", sender = client.user.id, options = {}) => {
    //let copy = message.toJSON()
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === "ephemeralMessage";
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string")
      msg[mtype] = {
        ...content,
        ...options,
      };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === client.user.id;

    return proto.WebMessageInfo.fromObject(copy);
  };

  return client;
}

startHisoka();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
