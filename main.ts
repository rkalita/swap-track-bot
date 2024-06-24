const { AptosClient } = require('aptos');
const client = new AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');

// Define the correct event handle based on PancakeSwap's smart contract
const eventHandleStruct = '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::PairEventHolder<0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2::assets_v1::EchoCoin002,0xf891d2e004973430cc2bbbee69f3d0f4adb9c7ae03137b4579f7bb9979283ee6::APTOS_FOMO::APTOS_FOMO>'; // Replace with the actual module and event
const eventHandleField = 'swap'; // Replace with the actual event handle field
// Replace with the actual pair address on PancakeSwap
const pairAddress = '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa';

async function getSwapEvents(pairAddress) {
    try {
        const events = await client.getEventsByEventHandle(pairAddress, eventHandleStruct, eventHandleField);
        if (events.length > 0) {
            console.log('Swap events:', events);
        } else {
            console.log('No swap events found.');
        }
    } catch (error) {
        if (error.message.includes('resource_not_found')) {
            console.error('Error: Resource not found. Please verify the address and event handle details.');
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }
}

getSwapEvents(pairAddress)
