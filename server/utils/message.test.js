const expect = require('expect');
const { generateMessage, generateLocationMessage } = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        let from = 'Moore';
        let text = 'Whats good bro';
        let message = generateMessage(from, text);

        expect(typeof(message.createdAt)).toBe('number');
        expect(message).toMatchObject({
            from,
            text
        });
    });
});

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        let from = 'Admin';
        let lat = 6.88499;
        let long = -17.8756;
        let url = `https://www.google.com/maps?q=${lat},${long}`;
        let message = generateLocationMessage(from, lat, long);

        expect(typeof(message.createdAt)).toBe('number');
        expect(message).toMatchObject({
            from,
            url
        });
    });
});