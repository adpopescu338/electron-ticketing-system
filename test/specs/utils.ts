import { DEFAULT_SYSTEM_SETTINGS } from '@repo/constants'

export const BASE_URL = `http://localhost:${DEFAULT_SYSTEM_SETTINGS.PORT}`;
export const QUEUE_1_NAME = 'test-queue';

export const swalConfirm = async () => {
    // await browser.pause(5000)
    const elem = $('.swal-button--confirm')
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