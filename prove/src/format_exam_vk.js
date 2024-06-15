
import fs from "fs";
import path from "path";
import * as curves from "../utils/curve.js";
import { utils } from "ffjavascript";
const { unstringifyBigInts } = utils;

const adaptToUncompressed = async (verificationKeyName) => {

    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyName, "utf8"));

    // from object to u8 array
    const vkey = unstringifyBigInts(verificationKey);

    console.log(vkey.curve)
    const curve = await curves.getCurveFromName(vkey.curve);

    const vk_alpha_1 = curve.G1.toUncompressed(curve.G1.fromObject(vkey.vk_alpha_1));
    const vk_beta_2 = curve.G2.toUncompressed(curve.G2.fromObject(vkey.vk_beta_2));
    const vk_gamma_2 = curve.G2.toUncompressed(curve.G2.fromObject(vkey.vk_gamma_2));
    const vk_delta_2 = curve.G2.toUncompressed(curve.G2.fromObject(vkey.vk_delta_2));
    const ic_0 = curve.G1.toUncompressed(curve.G1.fromObject(vkey.IC[0]));
    const ic_1 = curve.G1.toUncompressed(curve.G1.fromObject(vkey.IC[1]));

    let ic = [];
    ic.push(Array.from(ic_0));
    ic.push(Array.from(ic_1));

    let uncompressed_vkey = {};

    uncompressed_vkey.alpha_1 = Array.from(vk_alpha_1);
    uncompressed_vkey.beta_2 = Array.from(vk_beta_2);
    uncompressed_vkey.gamma_2 = Array.from(vk_gamma_2);
    uncompressed_vkey.delta_2 = Array.from(vk_delta_2);
    uncompressed_vkey.ic = ic;
    
    let hex_vkey = {};

    hex_vkey.alpha_1 = '0x'+Bytes2Str( uncompressed_vkey.alpha_1)
    hex_vkey.beta_2 = '0x'+Bytes2Str( uncompressed_vkey.beta_2)
    hex_vkey.gamma_2 = '0x'+Bytes2Str( uncompressed_vkey.gamma_2)
    hex_vkey.delta_2 = '0x'+Bytes2Str( uncompressed_vkey.delta_2)
    hex_vkey.ic0 = '0x'+Bytes2Str( uncompressed_vkey.ic[0])
    hex_vkey.ic1 = '0x'+Bytes2Str( uncompressed_vkey.ic[1])

    //NOTE: Specify the file path for the converted vkey file after formating.
    fs.writeFileSync(path.resolve(`./example-vkey-hex.json`), JSON.stringify(hex_vkey));

    console.log(`generate uncompressed verification data successfully!`);
    process.exit();
}

function Bytes2Str(arr) {
    let str = "";
    for (let i = 0; i < arr.length; i++) {
        let tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = "0" + tmp;
        }
        str += tmp;
    }
    return str;
}

//NOTE: Specify the file path for the vkey.
adaptToUncompressed(`./example-vkey.json`)
