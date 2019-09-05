const expect = require('expect');
const { isRealString } = require('./validation');

describe('isRealString', () => {
    it('should return true for real string', () => {
        string = "My name is Moore";
        expect(isRealString(string)).toBeTruthy();
    });

    it('should return false for stings with only spaces', () => {
        string = "        ";
        expect(isRealString(string)).toBeFalsy();
    });

    it('should return false for non-strings', () => {
        string = 123;
        expect(isRealString(string)).toBeFalsy();
    });
});