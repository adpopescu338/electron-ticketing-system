import { DEFAULT_SYSTEM_SETTINGS } from '@repo/constants'

export const BASE_URL = `http://localhost:${DEFAULT_SYSTEM_SETTINGS.PORT}`;
export const QUEUE_1_NAME = 'test-queue';

export const swalConfirm = async () => {
    const elem = $('button.swal2-confirm')
    await elem.waitForExist()
    await elem.click()
}

export const getCurrentItem = async () => {
    const tr = await $(`.queue-item`)
    await tr.waitForExist()
    const [itemNumber, itemDesk] = (await tr.getHTML(false)).split('</td>').map(x => x.split('>')[1])

    return { itemNumber, itemDesk }
}

export const verifyQueueItem = async (number: number, desk: string) => {
    const { itemNumber, itemDesk } = await getCurrentItem()

    expect(itemNumber).toBe(String(number))
    expect(itemDesk).toBe(desk)
}

export const writeIntoSwalInput = async (text: string) => {
    const input = await $('#swal2-input')
    await input.waitForExist()
    await input.setValue(text)
}