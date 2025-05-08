/// <reference types="react-scripts" />

import { Eip1193Provider } from "ethers"

type MyWindow = Window & typeof globalThis & {
    ethereum?: Eip1193Provider;
}
