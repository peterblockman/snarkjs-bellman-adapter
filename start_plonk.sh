#!/bin/sh

compile_and_ts_and_witness() {
  circuit_dir_name=$1

  cd ${circuit_dir_name}
  # start a new powers of tou ceremony(bn128)
  snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

  # contribute to the ceremony
  snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
  snarkjs powersoftau contribute pot12_0001.ptau pot12_0002.ptau --name="Second contribution" -v -e="some random text"

  snarkjs powersoftau export challenge pot12_0002.ptau challenge_0003
  snarkjs powersoftau challenge contribute bn128 challenge_0003 response_0003 -e="some random text"
  snarkjs powersoftau import response pot12_0002.ptau response_0003 pot12_0003.ptau -n="Third contribution name"

  # verify the ptau
  snarkjs powersoftau verify pot12_0003.ptau

  snarkjs powersoftau beacon pot12_0003.ptau pot12_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"

  # prepare the phase 2 (ceremony with circuit) 
  snarkjs powersoftau prepare phase2 pot12_beacon.ptau pot12_final.ptau -v

  snarkjs powersoftau verify pot12_final.ptau

  echo $(date +"%T") "coompile the circuit into r1cs, wasm and sym"
  itime="$(date -u +%s)"
  circom circuit.circom --r1cs --wasm --sym -p
  ftime="$(date -u +%s)"
  echo "	($(($(date -u +%s)-$itime))s)"

  echo $(date +"%T") "snarkjs info -r circuit.r1cs"
  snarkjs info -r circuit.r1cs

  # print the contraint
  snarkjs r1cs print circuit.r1cs circuit.sym

  #  export the r1cs to json
  snarkjs r1cs export json circuit.r1cs circuit.r1cs.json

  echo "calculating witness"
  cd circuit_js
  node generate_witness.js circuit.wasm ../input.json ../witness.wtns
  cd ..

  # generate circuit final zkey
  snarkjs plonk setup circuit.r1cs pot12_final.ptau circuit_final.zkey

  # export the verification key
  snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

  # generate proof
  echo "start generate proof..."
  snarkjs plonk prove circuit_final.zkey witness.wtns proof.json public.json

  # verify proof by snarkjs
  echo "verify the proof"
  snarkjs plonk verify verification_key.json public.json proof.json

}

if [ $# -eq 0 ]; then
  echo "Usage: $0 <circuit_dir_name>"
  exit 1
fi

circuit_dir_name=$1
echo "compile & trustesetup for circuit"
cd circuit/
compile_and_ts_and_witness "$circuit_dir_name"