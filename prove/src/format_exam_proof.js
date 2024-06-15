
import fs from "fs";
import path from "path";
import * as curves from "../utils/curve.js";
import { utils } from "ffjavascript";
const { unstringifyBigInts } = utils;


const adaptToUncompressed = async (proofName) => {
    const pof = JSON.parse(fs.readFileSync(proofName, "utf8"));

    // from object to u8 array
    const proof = unstringifyBigInts(pof);

    // Default using bn128 curve; if you want to use bls12-381 curve, you can change with "BLS12381"
    const curve = await curves.getCurveFromName("BN128");

    // which can be convert into Affine type in bellman
    const pi_a = curve.G1.toUncompressed(curve.G1.fromObject(proof.pi_a));
    const pi_b = curve.G2.toUncompressed(curve.G2.fromObject(proof.pi_b));
    const pi_c = curve.G1.toUncompressed(curve.G1.fromObject(proof.pi_c));

    let uncompressed_proof = {};
    uncompressed_proof.pi_a = Array.from(pi_a);
    uncompressed_proof.pi_b = Array.from(pi_b);
    uncompressed_proof.pi_c = Array.from(pi_c);

    let hex_proof = {};
    hex_proof.pi_a = '0x'+Bytes2Str( uncompressed_proof.pi_a)
    hex_proof.pi_b = '0x'+Bytes2Str( uncompressed_proof.pi_b)
    hex_proof.pi_c = '0x'+Bytes2Str( uncompressed_proof.pi_c)

    //NOTE: Specify the file path for the converted proof file after formating.
    fs.writeFileSync(path.resolve(`./exam-proof-hex.json`), JSON.stringify(hex_proof));

    console.log(`generate uncompressed proof data successfully!`);
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

//NOTE: Specify the file path for the proof.
adaptToUncompressed(`./exam-proof.json`)
