use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sum(left: i32, right: i32) -> i32 {
    left + right
}

#[wasm_bindgen]
pub fn subtract(left: i32, right: i32) -> i32 {
    left - right
}

#[wasm_bindgen]
pub fn multiply(left: i32, right: i32) -> i32 {
    left * right
}

#[wasm_bindgen]
pub fn divide(left: i32, right: i32) -> i32 {
    left / right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = sum(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn test_subtract() {
        let result = subtract(2, 2);
        assert_eq!(result, 0);
    }

    #[test]
    fn test_multiply() {
        let result = multiply(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn test_divide() {
        let result = divide(2, 2);
        assert_eq!(result, 1);
    }
}